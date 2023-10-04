# Security Model

## Authentication

CERBERUS supports two forms of authentication.

### Database Authentication

As the name suggests, this method is backed by the database. This is probably *not* what you would want to use in production - it is intentionally barebones, with no verification of users/rate limiting etc. You *could* with minimal changes make it more robust by making only admins able to create users, and then requiring password change on first login, etc. However, in production I would suggest simply using Active Directory.

### Active Directory Authentication

This method is what I would suggest to use in a live environment. This checks usernames/passwords against Active Directory.

### PKI

In production, I would also suggest enabling PKI. That way your users will not need to log in via username/password. With this method, the user will be "logged in" upon the first request that requires authentication.

## Authorisation