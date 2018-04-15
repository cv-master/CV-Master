#!/usr/bin/env bash
psql postgres -c "DROP DATABASE cv_db;"
psql postgres -c "DROP DATABASE cv_db_test;"
psql postgres -c "CREATE DATABASE cv_db;"
psql postgres -c "CREATE DATABASE cv_db_test;"
psql -d "cv_db" -f SQL_table_creation.sql
psql -d "cv_db_test" -f SQL_table_creation.sql
