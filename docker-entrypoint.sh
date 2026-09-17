#!/bin/sh
#
# Two jobs in one image.
#
#   docker-entrypoint.sh serve     apply migrations, then run the app
#   docker-entrypoint.sh migrate   apply migrations and exit
#
# The second exists so migrations can be run as a one-off ECS task, ahead of a
# rollout, once this service runs more than one container. Today it runs one,
# so `serve` does both and a bad migration crashes the task before it can be
# registered healthy -- which is the behaviour you want: a deploy that cannot
# migrate should not take traffic.
set -e

run_migrations() {
  if [ "${RUN_MIGRATIONS:-1}" != "1" ]; then
    echo "entrypoint: RUN_MIGRATIONS=${RUN_MIGRATIONS} — skipping migrations."
    return 0
  fi

  # Prisma takes a Postgres session advisory lock to migrate, and PgBouncer
  # cannot hold one -- that is what timed out every Netlify deploy with P1002.
  # DIRECT_URL is the unpooled string and schema.prisma points migrations at
  # it, so the only real failure mode left is it being set to a pooled host.
  case "${DIRECT_URL:-}" in
    "")
      echo "entrypoint: DIRECT_URL is not set. Migrations need the unpooled" \
           "connection string; refusing to start." >&2
      exit 1
      ;;
    *-pooler.*)
      echo "entrypoint: DIRECT_URL points at a pooler host. Prisma cannot" \
           "hold the migration advisory lock through PgBouncer and will fail" \
           "with P1002. Use the connection string without '-pooler'." >&2
      exit 1
      ;;
  esac

  echo "entrypoint: applying migrations…"
  # The CLI's real entry point, not node_modules/.bin/prisma. That name is a
  # symlink npm creates at install time, and the image copies the prisma
  # package without the .bin directory -- so the shim is not there and the
  # container dies on boot with "not found".
  node ./node_modules/prisma/build/index.js migrate deploy
}

case "${1:-serve}" in
  migrate)
    run_migrations
    echo "entrypoint: migrations applied."
    ;;
  serve)
    run_migrations
    echo "entrypoint: starting Next on ${HOSTNAME:-0.0.0.0}:${PORT:-3000}…"
    # exec so Node is PID 1 and receives ECS's SIGTERM directly, giving the
    # server its shutdown window instead of being killed 30 seconds later.
    exec node server.js
    ;;
  *)
    # Anything else is run verbatim, which keeps `aws ecs run-task` with a
    # command override useful for one-off debugging.
    exec "$@"
    ;;
esac
