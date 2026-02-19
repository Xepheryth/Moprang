#!/bin/bash
# Generate self-signed SSL certificate for HTTPS local development
# Use this script to create server.key and server.crt for HTTPS

openssl req -x509 -newkey rsa:2048 -keyout server.key -out server.crt -days 365 -nodes \
  -subj "/CN=localhost/O=KANS/C=ID"

echo "✅ SSL certificates generated:"
echo "   - server.key"
echo "   - server.crt"
echo ""
echo "These files are valid for 365 days."
echo "⚠️  Browser will show security warning (self-signed cert) - this is normal for development"
echo ""
echo "To enable HTTPS:"
echo "   1. Set: USE_HTTPS=true (or leave unset, default is true)"
echo "   2. Run: npm start"
echo "   3. Access: https://localhost:3000"
