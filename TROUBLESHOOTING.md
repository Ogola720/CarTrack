# 🔧 Troubleshooting Guide

## 503 Service Temporarily Unavailable

This error means your application isn't starting properly. Here's how to diagnose and fix it:

### 1. Check Sevalla Logs

**Via Sevalla Dashboard:**
1. Go to your app in Sevalla dashboard
2. Click on "Logs" tab
3. Look for error messages during startup

**Via CLI (if installed):**
```bash
sevalla logs --follow
```

### 2. Common Issues & Solutions

#### Issue: Build Failures
**Symptoms:** Build fails during deployment
**Solutions:**
```bash
# Check if all dependencies are listed in package.json
npm install
cd backend && npm install
cd ../frontend && npm install

# Test build locally
npm run build
```

#### Issue: Port Binding Problems
**Symptoms:** "EADDRINUSE" or port errors
**Solutions:**
- Ensure your app listens on `process.env.PORT`
- Use `0.0.0.0` as host, not `localhost`
- Default to port 8080 for Sevalla

#### Issue: Memory Limits
**Symptoms:** App crashes with "out of memory"
**Solutions:**
- Reduce Puppeteer usage (set `USE_MOCK_DATA=true`)
- Optimize database queries
- Upgrade to higher tier plan

#### Issue: Database Connection
**Symptoms:** MongoDB connection errors
**Solutions:**
- Check if MongoDB service is added in Sevalla
- Verify `MONGODB_URI` environment variable
- Use file storage fallback (`USE_MOCK_DATA=true`)

### 3. Quick Fixes

#### Fix 1: Use Mock Data (Fastest)
Update environment variables in Sevalla:
```
USE_MOCK_DATA=true
NODE_ENV=production
PORT=8080
```

#### Fix 2: Simplify Startup
Update `sevalla.yml`:
```yaml
run:
  command: node backend/server.js
env:
  NODE_ENV: production
  USE_MOCK_DATA: true
  PORT: 8080
```

#### Fix 3: Add Startup Delay
Sometimes the app needs more time to start:
```yaml
health_check:
  path: /health
  port: 8080
  initial_delay: 60s
  timeout: 30s
```

### 4. Test Locally First

Before deploying, always test locally:

```bash
# Set production environment
export NODE_ENV=production
export USE_MOCK_DATA=true
export PORT=8080

# Build and start
npm run build
npm start

# Test health endpoint
curl http://localhost:8080/health
```

### 5. Debugging Steps

1. **Check Build Logs**
   - Look for npm install errors
   - Check for missing dependencies
   - Verify build commands complete

2. **Check Runtime Logs**
   - Look for startup errors
   - Check database connection issues
   - Verify port binding

3. **Test Health Endpoint**
   ```bash
   curl https://your-app.sevalla.app/health
   ```

4. **Check Environment Variables**
   - Verify all required vars are set
   - Check for typos in variable names
   - Ensure values are correct format

### 6. Emergency Rollback

If deployment is broken:

1. **Revert to Previous Version**
   - Go to Sevalla dashboard
   - Find previous successful deployment
   - Click "Rollback"

2. **Quick Fix Deployment**
   ```bash
   # Make minimal changes
   git add .
   git commit -m "Fix: Emergency deployment fix"
   git push origin main
   ```

### 7. Contact Support

If issues persist:

**Sevalla Support:**
- Dashboard: Check support section
- Email: support@sevalla.com
- Include: App name, error logs, deployment time

**Application Support:**
- Create GitHub issue with:
  - Error logs from Sevalla
  - Environment variables (without secrets)
  - Steps to reproduce

### 8. Prevention

**Best Practices:**
- Always test locally before deploying
- Use staging environment for testing
- Monitor logs after deployment
- Set up health check alerts
- Keep dependencies updated

**Monitoring Setup:**
```yaml
# In sevalla.yml
health_check:
  path: /health
  port: 8080
  interval: 30s
  timeout: 10s
  retries: 3
```

### 9. Performance Optimization

**If app is slow or crashes:**

1. **Reduce Memory Usage**
   ```javascript
   // In scraper files
   if (process.env.NODE_ENV === 'production') {
     // Use smaller batch sizes
     // Implement pagination
     // Use file storage instead of MongoDB
   }
   ```

2. **Optimize Database Queries**
   ```javascript
   // Add indexes
   // Limit result sets
   // Use projection to select only needed fields
   ```

3. **Enable Caching**
   ```javascript
   // Cache API responses
   // Use Redis for session storage
   // Implement CDN for static assets
   ```

## Quick Recovery Checklist

- [ ] Check Sevalla logs for errors
- [ ] Verify environment variables
- [ ] Test health endpoint
- [ ] Check database connection
- [ ] Verify build completed successfully
- [ ] Test locally with same config
- [ ] Consider using mock data temporarily
- [ ] Contact support if needed

## Success Indicators

✅ **App is working when:**
- Health endpoint returns 200 OK
- Logs show "Server successfully started"
- No error messages in Sevalla logs
- Frontend loads without errors
- API endpoints respond correctly