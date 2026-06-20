#!/bin/bash
# Rebuild the 139k song database from the chunks
echo "Stitching database chunks..."
cat geethub_master.db.gz.part.* > geethub_master.db.gz

echo "Extracting database..."
gunzip -f geethub_master.db.gz

echo "Database successfully rebuilt! You can now start the Geethub server."
