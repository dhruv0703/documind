#!/usr/bin/env sh
set -eu

if [ -n "${DATABASE_URL:-}" ] && [ -z "${DB_URL:-}" ]; then
  case "$DATABASE_URL" in
    jdbc:postgresql://*)
      export DB_URL="$DATABASE_URL"
      ;;
    postgresql://*)
      db_uri_without_scheme="${DATABASE_URL#postgresql://}"
      db_host_and_path="${db_uri_without_scheme#*@}"
      export DB_URL="jdbc:postgresql://${db_host_and_path}"
      ;;
    *)
      export DB_URL="$DATABASE_URL"
      ;;
  esac
fi

exec java -jar /app/app.jar
