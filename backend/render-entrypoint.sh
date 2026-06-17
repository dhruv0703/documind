#!/usr/bin/env sh
set -eu

if [ -n "${DATABASE_URL:-}" ] && [ -z "${DB_URL:-}" ]; then
  case "$DATABASE_URL" in
    jdbc:postgresql://*)
      export DB_URL="$DATABASE_URL"
      ;;
    postgresql://*)
      db_uri_without_scheme="${DATABASE_URL#postgresql://}"
      db_credentials="${db_uri_without_scheme%%@*}"
      db_host_and_path="${db_uri_without_scheme#*@}"
      db_host_and_path="$(printf '%s' "$db_host_and_path" | sed 's/channel_binding=/channelBinding=/g')"
      export DB_URL="jdbc:postgresql://${db_host_and_path}"

      if [ -z "${DB_USERNAME:-}" ]; then
        export DB_USERNAME="${db_credentials%%:*}"
      fi

      if [ -z "${DB_PASSWORD:-}" ]; then
        export DB_PASSWORD="${db_credentials#*:}"
      fi
      ;;
    *)
      export DB_URL="$DATABASE_URL"
      ;;
  esac
fi

if [ -n "${OPENAI_COMPAT_API_KEY:-}" ]; then
  if [ -z "${SPRING_AI_OPENAI_API_KEY:-}" ]; then
    export SPRING_AI_OPENAI_API_KEY="$OPENAI_COMPAT_API_KEY"
  fi

  if [ -z "${SPRING_AI_OPENAI_CHAT_API_KEY:-}" ]; then
    export SPRING_AI_OPENAI_CHAT_API_KEY="$OPENAI_COMPAT_API_KEY"
  fi

  if [ -z "${SPRING_AI_OPENAI_EMBEDDING_API_KEY:-}" ]; then
    export SPRING_AI_OPENAI_EMBEDDING_API_KEY="$OPENAI_COMPAT_API_KEY"
  fi
fi

if [ -n "${GEMINI_API_KEY:-}" ]; then
  if [ -z "${SPRING_AI_OPENAI_API_KEY:-}" ]; then
    export SPRING_AI_OPENAI_API_KEY="$GEMINI_API_KEY"
  fi

  if [ -z "${SPRING_AI_OPENAI_CHAT_API_KEY:-}" ]; then
    export SPRING_AI_OPENAI_CHAT_API_KEY="$GEMINI_API_KEY"
  fi

  if [ -z "${SPRING_AI_OPENAI_EMBEDDING_API_KEY:-}" ]; then
    export SPRING_AI_OPENAI_EMBEDDING_API_KEY="$GEMINI_API_KEY"
  fi
fi

exec java -jar /app/app.jar
