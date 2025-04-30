# backend/militex/database_router.py

class DatabaseRouter:
    """
    A router to control database operations for models in the
    accounts and cars applications.
    """
    def db_for_read(self, model, **hints):
        """
        Attempts to read accounts models go to default database,
        cars models go to cars_db.
        """
        if model._meta.app_label == 'cars':
            return 'cars_db'
        return 'default'

    def db_for_write(self, model, **hints):
        """
        Attempts to write accounts models go to default database,
        cars models go to cars_db.
        """
        if model._meta.app_label == 'cars':
            return 'cars_db'
        return 'default'

    def allow_relation(self, obj1, obj2, **hints):
        """
        Allow relations if models are in the same database or
        in the accounts/cars apps.
        """
        if obj1._meta.app_label == obj2._meta.app_label:
            return True
        # Allow specific relationships between User and Car
        if (obj1._meta.app_label == 'accounts' and obj2._meta.app_label == 'cars') or \
           (obj1._meta.app_label == 'cars' and obj2._meta.app_label == 'accounts'):
            return True
        return None

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        """
        Make sure accounts models go to default database,
        cars models go to cars_db.
        """
        if app_label == 'cars':
            return db == 'cars_db'
        return db == 'default'