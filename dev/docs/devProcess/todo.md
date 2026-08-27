  # Filename todo.md
  # File version 0.2.1
 
 - AI must READ and FOLLOW todo.instructions.md

--- 

# Batch production oauth overhaul: aug 27 1253

# Batch storage requirements update: aug 27

- [ ] Define the shared storage contract for secure values (refresh token, Gemini API key, sheet ID, user mail) and non-secure per-user config.
- [ ] Add the production storage backend using the Cloudflare endpoints from the requirements, with separate secure and non-secure request paths.
- [ ] Keep the prototype storage mock available as a local adapter while production uses the Cloudflare service.
- [ ] Update storage keys and all auth, AI, sheet, settings, and config callers to use the new contract without storing secrets in configuration.
- [ ] Preserve user mail for silent login and remove it only on explicit logout or replacement by a different login.
- [ ] Ensure logout clears the refresh token, AI key, and sheet ID while retaining the user mail as required.
- [ ] Add configuration persistence through the non-secure config endpoint, including defaults and invalid-data fallback.
- [ ] Add environment/configuration for the Cloudflare storage service URL without hard-coding deployment details.
- [ ] Define the Cloudflare request and response payloads for secure values, config, and clearing stored values.
- [ ] Configure the production Cloudflare storage URL and authentication boundary for each release target.





