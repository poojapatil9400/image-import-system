IMAGE IMPORT SYSTEM
Google Drive → MinIO → PostgreSQL

PROJECT OVERVIEW
The Image Import System imports images from a public Google Drive folder, stores image files in MinIO object storage, and saves metadata in a PostgreSQL database. The system supports large folders using pagination and batch processing.

OBJECTIVES
- Import images from public Google Drive folders
- Store images in MinIO
- Store metadata in PostgreSQL
- Support scalable batch processing
- Follow microservice architecture

SYSTEM ARCHITECTURE
Google Drive
   |
API Service (Node.js)
   |
Worker Service
   |
MinIO + PostgreSQL

SERVICES
1. API Service
- Accepts Google Drive folder URL
- Lists images using Google Drive API
- Sends batch jobs to Worker Service
Port: 4000

2. Worker Service
- Downloads images
- Uploads images to MinIO
- Stores metadata in database
Port: 5000

3. PostgreSQL Database
Stores image metadata only

4. MinIO
Stores actual image files

TECH STACK
- Node.js, Express
- PostgreSQL
- MinIO
- Docker & Docker Compose
- Google Drive API

GOOGLE DRIVE SETUP
- Google Drive API enabled
- API Key used (no OAuth, no Service Account)
- Folder must be public

SETUP STEPS
1. Install prerequisites
2. Start Docker containers
3. Create database table
4. Install dependencies
5. Run worker and API services
6. Use frontend to import images

VERIFICATION
- MinIO: http://localhost:9001
- API: http://localhost:4000/images
- Database: SELECT name FROM images;

NOTES
- Only public Google Drive folders supported
- Designed for large-scale image imports

CONCLUSION
This project demonstrates a scalable backend image ingestion system using modern backend technologies.
