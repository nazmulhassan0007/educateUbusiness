#!/bin/sh
# Starts the dev server on :3001 and opens the new homepage once it answers.
PORT=3001
# A stale dev cache can hide CSS changes (new @utility classes never appear), so start clean.
rm -rf .next/dev
(until curl -s -o /dev/null "http://localhost:$PORT/new"; do sleep 1; done; open "http://localhost:$PORT/new") &
exec npx next dev -p $PORT
