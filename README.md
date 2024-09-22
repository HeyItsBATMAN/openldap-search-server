# OpenLDAP / ldapsearch Server

## How to use?

You can use the provided image from the ghcr:
```bash
docker run --rm -it -p 3000:3000 ghcr.io/heyitsbatman/openldap-search-server:main
```

Or build the container yourself (see [Requirements](#requirements)):
```bash
git clone https://github.com/HeyItsBATMAN/openldap-search-server.git
bun run docker:build
bun run docker:run
```

Afterwards you can send requests to the application on port `3000`.

A swagger documentation is available at `http://localhost:3000/swagger`.

## Examples

```javascript
fetch('http://localhost:3000/search', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    host: '',
    bindDn: '',
    bindPassword: '',
    searchBase: ''
    searchFilter: '' // optional
  })
})
```

## Requirements

If you intend to build and modify this image, the following applications are required:
- Bun ([Homepage](https://bun.sh/), [Github](https://github.com/oven-sh/bun))
- Docker ([Homepage](https://www.docker.com/), [Github](https://github.com/docker/cli))

## Motivation

I was getting frustrated with by LDAP queries working when using `ldapsearch`, but not when using any of the JavaScript/TypeScript implementations.

## Acknowledgements

- The OpenLDAP project ([Homepage](https://www.openldap.org/))
- Bun, the JavaScript runtime ([Homepage](https://bun.sh/), [Github](https://github.com/oven-sh/bun))
- ElysiaJS, the fast web framework ([Homepage](https://elysiajs.com/), [Github](https://github.com/elysiajs/elysia))
