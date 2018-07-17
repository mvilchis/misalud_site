# unicef_backend
To run this proyect:
 * First add your rapidpro token to .env file
 * Run docker-compose up
 * Run ```docker exec -it backend_unicef-backend python manage.py delete_indexe```
 * Run ```docker exec -it backend_unicef-backend python manage.py create_index```
 * Run ```docker exec -it backend_unicef-backend python manage.py download_test_runs```
