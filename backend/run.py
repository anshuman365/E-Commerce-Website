from app import create_app
from helpers import run_db_migration

app = create_app()

if __name__ == '__main__':
    #run_db_migration()
    app.run(debug=True)