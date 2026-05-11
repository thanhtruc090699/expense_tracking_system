#!/bin/bash
# Database seed and clear utility for Bill Buddy backend

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

usage() {
	echo "Usage: $0 <command>"
	echo ""
	echo "Commands:"
	echo "  seed    - Seed the database with test data"
	echo "  clear   - Clear all data (prisma migrate reset)"
	echo "  reset   - Clear and then seed (fresh start)"
	echo ""
	exit 1
}

seed_db() {
	echo "=== Seeding Database ==="
	npx ts-node seed-test-data.ts
	echo "✓ Done"
}

clear_db() {
	echo "=== Clearing Database ==="
	echo "Warning: This will drop and recreate all tables!"
	npx prisma migrate reset --force --skip-seed
	echo "✓ Database cleared"
}

if [ $# -eq 0 ]; then
	usage
fi

case "$1" in
	seed)
		seed_db
		;;
	clear)
		clear_db
		;;
	reset)
		clear_db
		echo ""
		seed_db
		;;
	*)
		echo "Unknown command: $1"
		usage
		;;
esac
