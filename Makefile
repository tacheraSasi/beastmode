run:
	bun start -c


update-version: 
	expobump 

build-apk: update-version
	bunx eas build -p android --profile preview

build-production: update-version
	bunx eas build -p android --profile production

build-submit: update-version
	bunx eas build -p android --profile production --auto-submit