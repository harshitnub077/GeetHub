#!/bin/bash

export FILTER_BRANCH_SQUELCH_WARNING=1

# Use filter-branch to rewrite messages
# We target the last 15 commits
git filter-branch -f --msg-filter '
  msg=$(cat)
  case "$GIT_COMMIT" in
    d5a1db4*) echo "added the song database" ;;
    88ac66b*) echo "checked the UI and sidebar" ;;
    1092b63*) echo "added some notes about the sidebar" ;;
    29c7ae8*) echo "ignored some side files" ;;
    8d358db*) echo "cleaned up the song data" ;;
    7cabdbc*) echo "made lyrics easier to read" ;;
    738022c*) echo "moved the sidebar around" ;;
    b2eecec*) echo "updated search notes" ;;
    ff22458*) echo "updated the song count" ;;
    a65b77e*) echo "added more songs to the list" ;;
    b1c5118*) echo "wrote a script to get more songs" ;;
    c38126a*) echo "got a list of song links" ;;
    544c5f2*) echo "added search and scraping scripts" ;;
    fff8bc2*) echo "cleaned up old scripts" ;;
    *) echo "$msg" ;;
  esac
' HEAD~15..HEAD
