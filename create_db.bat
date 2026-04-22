@echo off
set PGPASSWORD=Ganesh@2003
psql -U postgres -h 127.0.0.1 -p 5432 -c "CREATE DATABASE dashboard_db;"
echo Done.
