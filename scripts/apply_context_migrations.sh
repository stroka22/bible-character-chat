#!/bin/bash
# Script to apply reading plan context migrations to Supabase
# Usage: ./scripts/apply_context_migrations.sh

# Check if SUPABASE_DB_URL is set
if [ -z "$SUPABASE_DB_URL" ]; then
    echo "Error: SUPABASE_DB_URL environment variable is not set"
    echo ""
    echo "Set it with your Supabase connection string:"
    echo "export SUPABASE_DB_URL='postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres'"
    echo ""
    echo "You can find this in Supabase Dashboard -> Project Settings -> Database -> Connection string -> URI"
    exit 1
fi

echo "Applying reading plan context migrations..."
echo ""

# Apply Day 1 context
echo "1/4: Applying Day 1 context..."
psql "$SUPABASE_DB_URL" -f supabase/combined_day1_context.sql
if [ $? -ne 0 ]; then
    echo "Error applying Day 1 context"
    exit 1
fi
echo "Day 1 context applied successfully!"
echo ""

# Apply Day 2 context
echo "2/4: Applying Day 2 context..."
psql "$SUPABASE_DB_URL" -f supabase/combined_day2_context.sql
if [ $? -ne 0 ]; then
    echo "Error applying Day 2 context"
    exit 1
fi
echo "Day 2 context applied successfully!"
echo ""

# Apply Day 3 context
echo "3/4: Applying Day 3 context..."
psql "$SUPABASE_DB_URL" -f supabase/combined_day3_context.sql
if [ $? -ne 0 ]; then
    echo "Error applying Day 3 context"
    exit 1
fi
echo "Day 3 context applied successfully!"
echo ""

# Apply Day 4 context
echo "4/4: Applying Day 4 context..."
psql "$SUPABASE_DB_URL" -f supabase/combined_day4_context.sql
if [ $? -ne 0 ]; then
    echo "Error applying Day 4 context"
    exit 1
fi
echo "Day 4 context applied successfully!"
echo ""

echo "=========================================="
echo "All context migrations applied successfully!"
echo "=========================================="
