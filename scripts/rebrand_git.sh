#!/bin/bash

export FILTER_BRANCH_SQUELCH_WARNING=1

# Use filter-branch to rewrite messages
# We target the last 15 commits
git filter-branch -f --msg-filter '
  msg=$(cat)
  case "$GIT_COMMIT" in
    e74c273*) echo "Industrial Commit 39: Maintenance - Resolved search pagination state bugs and optimized chord parsing regex" ;;
    5a55bbf*) echo "Industrial Commit 38: Feature - Implemented trending discovery engine and curated seasonal song grids" ;;
    b7af9ea*) echo "Industrial Commit 37: Design - Finalized high-fidelity UI modules and synchronized extended song collections" ;;
    26255b5*) echo "Industrial Commit 36: Data Persistence - SQLite database initialized with unified chord schema" ;;
    ace7181*) echo "Industrial Commit 35: Quality Assurance - Visual regression check and performance validation of the sidebar profile" ;;
    464d115*) echo "Industrial Commit 34: Documentation - Detailed annotation of the Harmonic Profile and Sidebar performance logic" ;;
    28cf3d0*) echo "Industrial Commit 33: Infrastructure - Environment security enforced, database sidecars and build artifacts added to gitignore" ;;
    e08c13f*) echo "Industrial Commit 32: Data Normalization - Scrubbed scraped song entities for encoding consistency and schema alignment" ;;
    70f7cd3*) echo "Industrial Commit 31: User Experience - Dynamic typography scaling implemented for enhanced lyrics readability" ;;
    0aa2b5e*) echo "Industrial Commit 30: Architecture - Component decoupling; Harmonic Profile moved to Performance Sidebar" ;;
    b254053*) echo "Industrial Commit 29: Metadata - Updated SEO and OpenGraph descriptions for the 6.5K song library expansion" ;;
    134f288*) echo "Industrial Commit 28: UI - Synchronized global song counters with the production dataset" ;;
    0324e4f*) echo "Industrial Commit 27: Data Scaling - Integrated 6.5K+ verified songs into the core database" ;;
    a0ecbfa*) echo "Industrial Commit 26: Automation - Scripted scraper with bracketization logic and multi-source sitemap parsing" ;;
    154a3d6*) echo "Industrial Commit 25: DevEx - Cleaned up legacy scripts and initialized the modern data harvesting pipeline" ;;
    *) echo "$msg" ;;
  esac
' HEAD~15..HEAD
