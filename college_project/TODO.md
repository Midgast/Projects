# TODO: Fix errors not entering the student modal window

## Completed Steps
- [x] Add UserProfile model to models.py
- [x] Modify signals.py to create Student for new users with role='student'
- [x] Update tests.py to get UserProfile instead of creating it manually
- [x] Run makemigrations to create migration for UserProfile
- [x] Run migrate to apply the migration

## Followup Steps
- [ ] Test the application manually to ensure students can access their dashboard after login
