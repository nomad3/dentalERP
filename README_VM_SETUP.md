# 🚀 Quick VM Deployment Guide

This is a quick reference for deploying to a Google Cloud VM (or any VM).

## Prerequisites
- VM with Docker and Docker Compose installed
- At least 2GB RAM, 2 vCPU (e2-small or better)
- Open ports: 22 (SSH), 80 (HTTP), 443 (HTTPS)

## 🎯 Quick Deploy (5 Commands)

```bash
# 1. SSH into your VM
gcloud compute ssh dental-erp-vm --zone=us-central1-a

# 2. Clone repository
cd /opt && sudo git clone https://github.com/nomad3/dentalERP.git
cd dentalERP

# 3. Run setup script
sudo chmod +x setup-vm.sh
sudo ./setup-vm.sh

# 4. Start application
sudo docker-compose -f docker-compose.prod.yml up -d

# 5. Check status
sudo docker-compose -f docker-compose.prod.yml ps
```

That's it! Your app is now running! 🎉

## 📡 Access Your Application

```bash
# Get your VM's IP
gcloud compute instances describe dental-erp-vm --zone=us-central1-a \
  --format='get(networkInterfaces[0].accessConfigs[0].natIP)'

# Open in browser
http://YOUR_VM_IP
```

## 🔐 Set Up SSL (Recommended)

```bash
# Point your domain to the VM IP in your DNS provider
# Then run:

sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Certbot will:
# ✅ Get SSL certificate
# ✅ Configure nginx
# ✅ Set up auto-renewal
```

## 📊 Useful Commands

### View Logs
```bash
# All services
sudo docker-compose -f docker-compose.prod.yml logs -f

# Specific service
sudo docker-compose -f docker-compose.prod.yml logs -f backend
sudo docker-compose -f docker-compose.prod.yml logs -f frontend
```

### Restart Services
```bash
# All services
sudo docker-compose -f docker-compose.prod.yml restart

# Specific service
sudo docker-compose -f docker-compose.prod.yml restart backend
```

### Update Application
```bash
cd /opt/dentalERP
sudo git pull origin main
sudo docker-compose -f docker-compose.prod.yml up -d --build
```

### Backup Database
```bash
# Manual backup
sudo docker-compose -f docker-compose.prod.yml exec postgres \
  pg_dump -U postgres dental_erp | gzip > backup_$(date +%Y%m%d).sql.gz

# Enable automatic daily backups
sudo docker-compose -f docker-compose.prod.yml --profile backup up -d backup
```

### View Resource Usage
```bash
# Docker stats
sudo docker stats

# System resources
htop
```

## 🔧 Troubleshooting

### Containers won't start
```bash
# Check logs
sudo docker-compose -f docker-compose.prod.yml logs

# Check if ports are in use
sudo netstat -tulpn | grep -E '(3000|3001|5432|6379)'

# Restart everything
sudo docker-compose -f docker-compose.prod.yml down
sudo docker-compose -f docker-compose.prod.yml up -d
```

### Out of memory
```bash
# Check memory usage
free -h

# View container memory
sudo docker stats --no-stream

# Consider upgrading VM to e2-medium
```

### Can't connect to application
```bash
# Check firewall
sudo ufw status

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Check nginx
sudo systemctl status nginx
sudo nginx -t
```

## 📈 Monitoring

### Install Netdata (recommended)
```bash
bash <(curl -Ss https://my-netdata.io/kickstart.sh)

# Access at: http://YOUR_IP:19999
```

### View Application Health
```bash
curl http://localhost:3001/health
```

## 💾 Backup & Restore

### Create Backup
```bash
# Database
sudo docker-compose -f docker-compose.prod.yml exec -T postgres \
  pg_dump -U postgres dental_erp | gzip > backup.sql.gz

# All data (including volumes)
sudo docker-compose -f docker-compose.prod.yml down
sudo tar -czf dental-erp-full-backup.tar.gz /opt/dental-erp /var/lib/docker/volumes
sudo docker-compose -f docker-compose.prod.yml up -d
```

### Restore Backup
```bash
# Database
gunzip < backup.sql.gz | sudo docker-compose -f docker-compose.prod.yml exec -T postgres \
  psql -U postgres dental_erp
```

## 🔐 Security Checklist

- [ ] Change SSH port (edit `/etc/ssh/sshd_config`)
- [ ] Disable root login
- [ ] Set up fail2ban (`sudo apt-get install fail2ban`)
- [ ] Enable UFW firewall
- [ ] Install SSL certificate
- [ ] Set up automatic security updates
- [ ] Regular backups configured
- [ ] Strong passwords in `.env.production`

## 📚 Full Documentation

For complete setup guide with nginx configuration, monitoring, and more:
- See `DEPLOYMENT_GCP_VM.md`

## 💰 Cost

e2-small VM: ~$20-25/month
- Handles 500-2000 concurrent users
- 2 vCPU, 2GB RAM
- 30GB SSD

Need more power? Resize to e2-medium ($40/month)

## 🆘 Need Help?

1. Check logs: `sudo docker-compose -f docker-compose.prod.yml logs`
2. Check `DEPLOYMENT_GCP_VM.md` for detailed troubleshooting
3. Check container health: `sudo docker-compose -f docker-compose.prod.yml ps`

---

**Ready to deploy? Run the commands above!** 🚀
