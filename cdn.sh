# This script pushes the latest web code from the build directory into the CDN repository.
# It requires the aws CLI to be installed and authorized. You must run aws configure to authorize
aws s3 sync build/ s3://tc-content/arena/web-v0.1/ --region us-west-1 --acl public-read