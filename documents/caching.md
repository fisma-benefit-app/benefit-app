# How To Flush All Caches

- delete browser cache, cookies
- In Heroku you might need to delete the build cache. See internet for up-to-date instructions

Spring caches should not be in use, but if nothing else helps: https://docs.spring.io/spring-boot/reference/io/caching.html

Vite and Gradle may have cached something.
https://vite.dev/guide/dep-pre-bundling
https://docs.gradle.org/current/userguide/build_cache.html
https://docs.gradle.org/current/userguide/directory_layout.html#dir:gradle_user_home:configure_cache_cleanup
