#!/usr/bin/env sh
set -eu

if [ -n "${DATABASE_URL:-}" ] && [ -z "${DB_URL:-}" ]; then
  case "$DATABASE_URL" in
    jdbc:postgresql://*)
      export DB_URL="$DATABASE_URL"
      ;;
    postgresql://*)
      export DB_URL="jdbc:${DATABASE_URL}"
      ;;
    *)
      export DB_URL="$DATABASE_URL"
      ;;
  esac
fi

exec java -jar /app/app.jar
