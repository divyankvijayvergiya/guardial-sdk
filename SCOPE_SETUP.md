# Setting Up @byndia npm Scope

Before publishing the SDKs, you need to create the `@byndia` organization on npm.

## Step 1: Create the Organization

1. Visit: https://www.npmjs.com/org/create
2. Organization name: `byndia` (without the @)
3. Complete the setup process
4. Add yourself as owner/member

## Step 2: Verify Access

```bash
npm org ls @byndia
```

You should see your username listed.

## Step 3: Publish

Once the scope is created, you can publish:

```bash
cd sdk
./publish.sh
```

## Alternative: Use Existing Scope

If you want to use a different scope that already exists:

1. Update `package.json` files:
   - `sdk/typescript/package.json` - change `"name": "@byndia/guardial-sveltekit-sdk"`
   - `sdk/react/package.json` - change `"name": "@byndia/guardial-react-sdk"`

2. Update all references in:
   - `sdk/publish.sh`
   - `sdk/publish-with-otp.sh`
   - `sdk/publish-react.sh`
   - Documentation files

## Troubleshooting

**Error: Scope not found**
- Make sure the organization exists at https://www.npmjs.com/org/byndia
- Verify you're added as a member/owner

**Error: Access denied**
- Check you have publish permissions for the scope
- Run: `npm org ls @byndia` to see members



