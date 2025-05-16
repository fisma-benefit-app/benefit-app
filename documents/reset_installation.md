- Shut down backend
- Shut down frontend
- Flush caches caching.md
- Restart backend
- Restart frontend

If that doesn't help and if you're using Docker also remove everything in Docker
docker system prune -a -f --volumes 

If instead of Docker you're using a local installation of database, remove everything relating to the application and  reinitialize the database ** TODO How? **
