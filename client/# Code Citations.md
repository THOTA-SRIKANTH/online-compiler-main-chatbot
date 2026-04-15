# Code Citations

## License: unknown
https://github.com/iluwatar/java-design-patterns/blob/b1f8a16b9c42add590c05c02d5c965a9ca28b7a6/cloud-static-content-hosting/README.md

```
## **Step-by-Step: Apply Bucket Policy**

### **Step 1 — AWS Console (Easiest)**

1. Go to AWS Console → S3 → **online-compiler-frontend-codemeet**
2. Click **Permissions** tab
3. Scroll to **Bucket policy** → Click **Edit**
4. Delete any existing policy
5. Paste this exact policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::online-compiler-frontend-codemeet/*"
    },
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::online-compiler-frontend-codemeet/*",
      "Condition": {
        "ArnLike": {
          "AWS
```


## License: Apache-2.0
https://github.com/justinharringa/harringa.com/blob/e9d1c1bd35bc2c5cf62dba675aecb9ed3a9025dd/build/s3_test_bucket.tf

```
## **Step-by-Step: Apply Bucket Policy**

### **Step 1 — AWS Console (Easiest)**

1. Go to AWS Console → S3 → **online-compiler-frontend-codemeet**
2. Click **Permissions** tab
3. Scroll to **Bucket policy** → Click **Edit**
4. Delete any existing policy
5. Paste this exact policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::online-compiler-frontend-codemeet/*"
    },
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::online-compiler-frontend-codemeet/*",
      "Condition": {
        "ArnLike": {
          "AWS:
```


## License: Apache-2.0
https://github.com/Sage-Bionetworks/Synapse-Stack-Builder/blob/c0ce9ac653ff0d91bf63a573d48a385b77cd5cf6/src/main/resources/templates/s3/s3-bucket-policy.json.vpt

```
## **Step-by-Step: Apply Bucket Policy**

### **Step 1 — AWS Console (Easiest)**

1. Go to AWS Console → S3 → **online-compiler-frontend-codemeet**
2. Click **Permissions** tab
3. Scroll to **Bucket policy** → Click **Edit**
4. Delete any existing policy
5. Paste this exact policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::online-compiler-frontend-codemeet/*"
    },
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::online-compiler-frontend-codemeet/*",
      "Condition": {
        "ArnLike": {
          "AWS:SourceArn": [
            "arn:aws:
```


## License: Apache-2.0
https://github.com/Sage-Bionetworks/Synapse-Stack-Builder/blob/c0ce9ac653ff0d91bf63a573d48a385b77cd5cf6/src/main/resources/templates/s3/s3-bucket-policy.json.vpt

```
## **Step-by-Step: Apply Bucket Policy**

### **Step 1 — AWS Console (Easiest)**

1. Go to AWS Console → S3 → **online-compiler-frontend-codemeet**
2. Click **Permissions** tab
3. Scroll to **Bucket policy** → Click **Edit**
4. Delete any existing policy
5. Paste this exact policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::online-compiler-frontend-codemeet/*"
    },
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::online-compiler-frontend-codemeet/*",
      "Condition": {
        "ArnLike": {
          "AWS:SourceArn": [
            "arn:aws:
```


## License: Apache-2.0
https://github.com/Sage-Bionetworks/Synapse-Stack-Builder/blob/c0ce9ac653ff0d91bf63a573d48a385b77cd5cf6/src/main/resources/templates/s3/s3-bucket-policy.json.vpt

```
## **Step-by-Step: Apply Bucket Policy**

### **Step 1 — AWS Console (Easiest)**

1. Go to AWS Console → S3 → **online-compiler-frontend-codemeet**
2. Click **Permissions** tab
3. Scroll to **Bucket policy** → Click **Edit**
4. Delete any existing policy
5. Paste this exact policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::online-compiler-frontend-codemeet/*"
    },
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::online-compiler-frontend-codemeet/*",
      "Condition": {
        "ArnLike": {
          "AWS:SourceArn": [
            "arn:aws:
```


## License: Apache-2.0
https://github.com/Sage-Bionetworks/Synapse-Stack-Builder/blob/c0ce9ac653ff0d91bf63a573d48a385b77cd5cf6/src/main/resources/templates/s3/s3-bucket-policy.json.vpt

```
## **Step-by-Step: Apply Bucket Policy**

### **Step 1 — AWS Console (Easiest)**

1. Go to AWS Console → S3 → **online-compiler-frontend-codemeet**
2. Click **Permissions** tab
3. Scroll to **Bucket policy** → Click **Edit**
4. Delete any existing policy
5. Paste this exact policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::online-compiler-frontend-codemeet/*"
    },
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::online-compiler-frontend-codemeet/*",
      "Condition": {
        "ArnLike": {
          "AWS:SourceArn": [
            "arn:aws:
```


## License: Apache-2.0
https://github.com/Sage-Bionetworks/Synapse-Stack-Builder/blob/c0ce9ac653ff0d91bf63a573d48a385b77cd5cf6/src/main/resources/templates/s3/s3-bucket-policy.json.vpt

```
## **Step-by-Step: Apply Bucket Policy**

### **Step 1 — AWS Console (Easiest)**

1. Go to AWS Console → S3 → **online-compiler-frontend-codemeet**
2. Click **Permissions** tab
3. Scroll to **Bucket policy** → Click **Edit**
4. Delete any existing policy
5. Paste this exact policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::online-compiler-frontend-codemeet/*"
    },
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::online-compiler-frontend-codemeet/*",
      "Condition": {
        "ArnLike": {
          "AWS:SourceArn": [
            "arn:aws:
```


## License: Apache-2.0
https://github.com/Sage-Bionetworks/Synapse-Stack-Builder/blob/c0ce9ac653ff0d91bf63a573d48a385b77cd5cf6/src/main/resources/templates/s3/s3-bucket-policy.json.vpt

```
## **Step-by-Step: Apply Bucket Policy**

### **Step 1 — AWS Console (Easiest)**

1. Go to AWS Console → S3 → **online-compiler-frontend-codemeet**
2. Click **Permissions** tab
3. Scroll to **Bucket policy** → Click **Edit**
4. Delete any existing policy
5. Paste this exact policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::online-compiler-frontend-codemeet/*"
    },
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::online-compiler-frontend-codemeet/*",
      "Condition": {
        "ArnLike": {
          "AWS:SourceArn": [
            "arn:aws:
```


## License: Apache-2.0
https://github.com/justinharringa/harringa.com/blob/e9d1c1bd35bc2c5cf62dba675aecb9ed3a9025dd/build/s3_test_bucket.tf

```
## **Step-by-Step: Apply Bucket Policy**

### **Step 1 — AWS Console (Easiest)**

1. Go to AWS Console → S3 → **online-compiler-frontend-codemeet**
2. Click **Permissions** tab
3. Scroll to **Bucket policy** → Click **Edit**
4. Delete any existing policy
5. Paste this exact policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::online-compiler-frontend-codemeet/*"
    },
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::online-compiler-frontend-codemeet/*",
      "Condition": {
        "ArnLike": {
          "AWS:SourceArn": [
            "arn:aws:cloudfront::319641750027:distribution/E2BFDQ1GVQH6KE",
            "arn:aws:cloudfront::319641750027:distribution/E4GMQAG8OJ9UG"
          ]
        }
      }
    }
  ]
}
```

6. Click **Save changes**

---

### **Step 2 — Disable Block Public Access**

Still in **Permissions** tab:

1. Click **Block public access (bucket settings)** → **Edit**
2. **Uncheck all 4 boxes:**
   - ☐ Block all public access
   - ☐ Block public access granted through new ACLs
   - ☐ Block public access granted through any ACLs
   - ☐ Block public access granted through new bucket policies
3. Click **Save changes**
4. Type `confirm` in popup → **Confirm**

---

### **Step 3 — Test Access**

Open in browser:
```
https://online-compiler-frontend-codemeet.s3.amazonaws.com/index.html
```

**Should see:** Your React app (login page)
**Should NOT see:** XML error

---

## **Alternative: Command Line (AWS CLI)**

If you prefer terminal on your local machine:

### **1. Create policy file**

```bash
cat > bucket-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::online-compiler-frontend-codemeet/*"
    },
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      
```


## License: unknown
https://github.com/albertlockett/website/blob/70421d9e03c451a9613b89d0be2c4774c40bbd7d/src/markdown-pages/post-1.md

```
## **Step-by-Step: Apply Bucket Policy**

### **Step 1 — AWS Console (Easiest)**

1. Go to AWS Console → S3 → **online-compiler-frontend-codemeet**
2. Click **Permissions** tab
3. Scroll to **Bucket policy** → Click **Edit**
4. Delete any existing policy
5. Paste this exact policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::online-compiler-frontend-codemeet/*"
    },
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::online-compiler-frontend-codemeet/*",
      "Condition": {
        "ArnLike": {
          "AWS:SourceArn": [
            "arn:aws:cloudfront::319641750027:distribution/E2BFDQ1GVQH6KE",
            "arn:aws:cloudfront::319641750027:distribution/E4GMQAG8OJ9UG"
          ]
        }
      }
    }
  ]
}
```

6. Click **Save changes**

---

### **Step 2 — Disable Block Public Access**

Still in **Permissions** tab:

1. Click **Block public access (bucket settings)** → **Edit**
2. **Uncheck all 4 boxes:**
   - ☐ Block all public access
   - ☐ Block public access granted through new ACLs
   - ☐ Block public access granted through any ACLs
   - ☐ Block public access granted through new bucket policies
3. Click **Save changes**
4. Type `confirm` in popup → **Confirm**

---

### **Step 3 — Test Access**

Open in browser:
```
https://online-compiler-frontend-codemeet.s3.amazonaws.com/index.html
```

**Should see:** Your React app (login page)
**Should NOT see:** XML error

---

## **Alternative: Command Line (AWS CLI)**

If you prefer terminal on your local machine:

### **1. Create policy file**

```bash
cat > bucket-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::online-compiler-frontend-codemeet/*"
    },
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      
```


## License: Apache-2.0
https://github.com/justinharringa/harringa.com/blob/e9d1c1bd35bc2c5cf62dba675aecb9ed3a9025dd/build/s3_test_bucket.tf

```
## **Step-by-Step: Apply Bucket Policy**

### **Step 1 — AWS Console (Easiest)**

1. Go to AWS Console → S3 → **online-compiler-frontend-codemeet**
2. Click **Permissions** tab
3. Scroll to **Bucket policy** → Click **Edit**
4. Delete any existing policy
5. Paste this exact policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::online-compiler-frontend-codemeet/*"
    },
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::online-compiler-frontend-codemeet/*",
      "Condition": {
        "ArnLike": {
          "AWS:SourceArn": [
            "arn:aws:cloudfront::319641750027:distribution/E2BFDQ1GVQH6KE",
            "arn:aws:cloudfront::319641750027:distribution/E4GMQAG8OJ9UG"
          ]
        }
      }
    }
  ]
}
```

6. Click **Save changes**

---

### **Step 2 — Disable Block Public Access**

Still in **Permissions** tab:

1. Click **Block public access (bucket settings)** → **Edit**
2. **Uncheck all 4 boxes:**
   - ☐ Block all public access
   - ☐ Block public access granted through new ACLs
   - ☐ Block public access granted through any ACLs
   - ☐ Block public access granted through new bucket policies
3. Click **Save changes**
4. Type `confirm` in popup → **Confirm**

---

### **Step 3 — Test Access**

Open in browser:
```
https://online-compiler-frontend-codemeet.s3.amazonaws.com/index.html
```

**Should see:** Your React app (login page)
**Should NOT see:** XML error

---

## **Alternative: Command Line (AWS CLI)**

If you prefer terminal on your local machine:

### **1. Create policy file**

```bash
cat > bucket-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::online-compiler-frontend-codemeet/*"
    },
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      
```


## License: unknown
https://github.com/albertlockett/website/blob/70421d9e03c451a9613b89d0be2c4774c40bbd7d/src/markdown-pages/post-1.md

```
## **Step-by-Step: Apply Bucket Policy**

### **Step 1 — AWS Console (Easiest)**

1. Go to AWS Console → S3 → **online-compiler-frontend-codemeet**
2. Click **Permissions** tab
3. Scroll to **Bucket policy** → Click **Edit**
4. Delete any existing policy
5. Paste this exact policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::online-compiler-frontend-codemeet/*"
    },
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::online-compiler-frontend-codemeet/*",
      "Condition": {
        "ArnLike": {
          "AWS:SourceArn": [
            "arn:aws:cloudfront::319641750027:distribution/E2BFDQ1GVQH6KE",
            "arn:aws:cloudfront::319641750027:distribution/E4GMQAG8OJ9UG"
          ]
        }
      }
    }
  ]
}
```

6. Click **Save changes**

---

### **Step 2 — Disable Block Public Access**

Still in **Permissions** tab:

1. Click **Block public access (bucket settings)** → **Edit**
2. **Uncheck all 4 boxes:**
   - ☐ Block all public access
   - ☐ Block public access granted through new ACLs
   - ☐ Block public access granted through any ACLs
   - ☐ Block public access granted through new bucket policies
3. Click **Save changes**
4. Type `confirm` in popup → **Confirm**

---

### **Step 3 — Test Access**

Open in browser:
```
https://online-compiler-frontend-codemeet.s3.amazonaws.com/index.html
```

**Should see:** Your React app (login page)
**Should NOT see:** XML error

---

## **Alternative: Command Line (AWS CLI)**

If you prefer terminal on your local machine:

### **1. Create policy file**

```bash
cat > bucket-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::online-compiler-frontend-codemeet/*"
    },
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      
```


## License: Apache-2.0
https://github.com/justinharringa/harringa.com/blob/e9d1c1bd35bc2c5cf62dba675aecb9ed3a9025dd/build/s3_test_bucket.tf

```
## **Step-by-Step: Apply Bucket Policy**

### **Step 1 — AWS Console (Easiest)**

1. Go to AWS Console → S3 → **online-compiler-frontend-codemeet**
2. Click **Permissions** tab
3. Scroll to **Bucket policy** → Click **Edit**
4. Delete any existing policy
5. Paste this exact policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::online-compiler-frontend-codemeet/*"
    },
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::online-compiler-frontend-codemeet/*",
      "Condition": {
        "ArnLike": {
          "AWS:SourceArn": [
            "arn:aws:cloudfront::319641750027:distribution/E2BFDQ1GVQH6KE",
            "arn:aws:cloudfront::319641750027:distribution/E4GMQAG8OJ9UG"
          ]
        }
      }
    }
  ]
}
```

6. Click **Save changes**

---

### **Step 2 — Disable Block Public Access**

Still in **Permissions** tab:

1. Click **Block public access (bucket settings)** → **Edit**
2. **Uncheck all 4 boxes:**
   - ☐ Block all public access
   - ☐ Block public access granted through new ACLs
   - ☐ Block public access granted through any ACLs
   - ☐ Block public access granted through new bucket policies
3. Click **Save changes**
4. Type `confirm` in popup → **Confirm**

---

### **Step 3 — Test Access**

Open in browser:
```
https://online-compiler-frontend-codemeet.s3.amazonaws.com/index.html
```

**Should see:** Your React app (login page)
**Should NOT see:** XML error

---

## **Alternative: Command Line (AWS CLI)**

If you prefer terminal on your local machine:

### **1. Create policy file**

```bash
cat > bucket-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::online-compiler-frontend-codemeet/*"
    },
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      
```


## License: unknown
https://github.com/albertlockett/website/blob/70421d9e03c451a9613b89d0be2c4774c40bbd7d/src/markdown-pages/post-1.md

```
## **Step-by-Step: Apply Bucket Policy**

### **Step 1 — AWS Console (Easiest)**

1. Go to AWS Console → S3 → **online-compiler-frontend-codemeet**
2. Click **Permissions** tab
3. Scroll to **Bucket policy** → Click **Edit**
4. Delete any existing policy
5. Paste this exact policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::online-compiler-frontend-codemeet/*"
    },
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::online-compiler-frontend-codemeet/*",
      "Condition": {
        "ArnLike": {
          "AWS:SourceArn": [
            "arn:aws:cloudfront::319641750027:distribution/E2BFDQ1GVQH6KE",
            "arn:aws:cloudfront::319641750027:distribution/E4GMQAG8OJ9UG"
          ]
        }
      }
    }
  ]
}
```

6. Click **Save changes**

---

### **Step 2 — Disable Block Public Access**

Still in **Permissions** tab:

1. Click **Block public access (bucket settings)** → **Edit**
2. **Uncheck all 4 boxes:**
   - ☐ Block all public access
   - ☐ Block public access granted through new ACLs
   - ☐ Block public access granted through any ACLs
   - ☐ Block public access granted through new bucket policies
3. Click **Save changes**
4. Type `confirm` in popup → **Confirm**

---

### **Step 3 — Test Access**

Open in browser:
```
https://online-compiler-frontend-codemeet.s3.amazonaws.com/index.html
```

**Should see:** Your React app (login page)
**Should NOT see:** XML error

---

## **Alternative: Command Line (AWS CLI)**

If you prefer terminal on your local machine:

### **1. Create policy file**

```bash
cat > bucket-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::online-compiler-frontend-codemeet/*"
    },
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      
```


## License: Apache-2.0
https://github.com/justinharringa/harringa.com/blob/e9d1c1bd35bc2c5cf62dba675aecb9ed3a9025dd/build/s3_test_bucket.tf

```
## **Step-by-Step: Apply Bucket Policy**

### **Step 1 — AWS Console (Easiest)**

1. Go to AWS Console → S3 → **online-compiler-frontend-codemeet**
2. Click **Permissions** tab
3. Scroll to **Bucket policy** → Click **Edit**
4. Delete any existing policy
5. Paste this exact policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::online-compiler-frontend-codemeet/*"
    },
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::online-compiler-frontend-codemeet/*",
      "Condition": {
        "ArnLike": {
          "AWS:SourceArn": [
            "arn:aws:cloudfront::319641750027:distribution/E2BFDQ1GVQH6KE",
            "arn:aws:cloudfront::319641750027:distribution/E4GMQAG8OJ9UG"
          ]
        }
      }
    }
  ]
}
```

6. Click **Save changes**

---

### **Step 2 — Disable Block Public Access**

Still in **Permissions** tab:

1. Click **Block public access (bucket settings)** → **Edit**
2. **Uncheck all 4 boxes:**
   - ☐ Block all public access
   - ☐ Block public access granted through new ACLs
   - ☐ Block public access granted through any ACLs
   - ☐ Block public access granted through new bucket policies
3. Click **Save changes**
4. Type `confirm` in popup → **Confirm**

---

### **Step 3 — Test Access**

Open in browser:
```
https://online-compiler-frontend-codemeet.s3.amazonaws.com/index.html
```

**Should see:** Your React app (login page)
**Should NOT see:** XML error

---

## **Alternative: Command Line (AWS CLI)**

If you prefer terminal on your local machine:

### **1. Create policy file**

```bash
cat > bucket-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::online-compiler-frontend-codemeet/*"
    },
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      
```


## License: unknown
https://github.com/albertlockett/website/blob/70421d9e03c451a9613b89d0be2c4774c40bbd7d/src/markdown-pages/post-1.md

```
## **Step-by-Step: Apply Bucket Policy**

### **Step 1 — AWS Console (Easiest)**

1. Go to AWS Console → S3 → **online-compiler-frontend-codemeet**
2. Click **Permissions** tab
3. Scroll to **Bucket policy** → Click **Edit**
4. Delete any existing policy
5. Paste this exact policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::online-compiler-frontend-codemeet/*"
    },
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::online-compiler-frontend-codemeet/*",
      "Condition": {
        "ArnLike": {
          "AWS:SourceArn": [
            "arn:aws:cloudfront::319641750027:distribution/E2BFDQ1GVQH6KE",
            "arn:aws:cloudfront::319641750027:distribution/E4GMQAG8OJ9UG"
          ]
        }
      }
    }
  ]
}
```

6. Click **Save changes**

---

### **Step 2 — Disable Block Public Access**

Still in **Permissions** tab:

1. Click **Block public access (bucket settings)** → **Edit**
2. **Uncheck all 4 boxes:**
   - ☐ Block all public access
   - ☐ Block public access granted through new ACLs
   - ☐ Block public access granted through any ACLs
   - ☐ Block public access granted through new bucket policies
3. Click **Save changes**
4. Type `confirm` in popup → **Confirm**

---

### **Step 3 — Test Access**

Open in browser:
```
https://online-compiler-frontend-codemeet.s3.amazonaws.com/index.html
```

**Should see:** Your React app (login page)
**Should NOT see:** XML error

---

## **Alternative: Command Line (AWS CLI)**

If you prefer terminal on your local machine:

### **1. Create policy file**

```bash
cat > bucket-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::online-compiler-frontend-codemeet/*"
    },
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      
```


## License: Apache-2.0
https://github.com/justinharringa/harringa.com/blob/e9d1c1bd35bc2c5cf62dba675aecb9ed3a9025dd/build/s3_test_bucket.tf

```
## **Step-by-Step: Apply Bucket Policy**

### **Step 1 — AWS Console (Easiest)**

1. Go to AWS Console → S3 → **online-compiler-frontend-codemeet**
2. Click **Permissions** tab
3. Scroll to **Bucket policy** → Click **Edit**
4. Delete any existing policy
5. Paste this exact policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::online-compiler-frontend-codemeet/*"
    },
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::online-compiler-frontend-codemeet/*",
      "Condition": {
        "ArnLike": {
          "AWS:SourceArn": [
            "arn:aws:cloudfront::319641750027:distribution/E2BFDQ1GVQH6KE",
            "arn:aws:cloudfront::319641750027:distribution/E4GMQAG8OJ9UG"
          ]
        }
      }
    }
  ]
}
```

6. Click **Save changes**

---

### **Step 2 — Disable Block Public Access**

Still in **Permissions** tab:

1. Click **Block public access (bucket settings)** → **Edit**
2. **Uncheck all 4 boxes:**
   - ☐ Block all public access
   - ☐ Block public access granted through new ACLs
   - ☐ Block public access granted through any ACLs
   - ☐ Block public access granted through new bucket policies
3. Click **Save changes**
4. Type `confirm` in popup → **Confirm**

---

### **Step 3 — Test Access**

Open in browser:
```
https://online-compiler-frontend-codemeet.s3.amazonaws.com/index.html
```

**Should see:** Your React app (login page)
**Should NOT see:** XML error

---

## **Alternative: Command Line (AWS CLI)**

If you prefer terminal on your local machine:

### **1. Create policy file**

```bash
cat > bucket-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::online-compiler-frontend-codemeet/*"
    },
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      
```


## License: unknown
https://github.com/albertlockett/website/blob/70421d9e03c451a9613b89d0be2c4774c40bbd7d/src/markdown-pages/post-1.md

```
## **Step-by-Step: Apply Bucket Policy**

### **Step 1 — AWS Console (Easiest)**

1. Go to AWS Console → S3 → **online-compiler-frontend-codemeet**
2. Click **Permissions** tab
3. Scroll to **Bucket policy** → Click **Edit**
4. Delete any existing policy
5. Paste this exact policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::online-compiler-frontend-codemeet/*"
    },
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::online-compiler-frontend-codemeet/*",
      "Condition": {
        "ArnLike": {
          "AWS:SourceArn": [
            "arn:aws:cloudfront::319641750027:distribution/E2BFDQ1GVQH6KE",
            "arn:aws:cloudfront::319641750027:distribution/E4GMQAG8OJ9UG"
          ]
        }
      }
    }
  ]
}
```

6. Click **Save changes**

---

### **Step 2 — Disable Block Public Access**

Still in **Permissions** tab:

1. Click **Block public access (bucket settings)** → **Edit**
2. **Uncheck all 4 boxes:**
   - ☐ Block all public access
   - ☐ Block public access granted through new ACLs
   - ☐ Block public access granted through any ACLs
   - ☐ Block public access granted through new bucket policies
3. Click **Save changes**
4. Type `confirm` in popup → **Confirm**

---

### **Step 3 — Test Access**

Open in browser:
```
https://online-compiler-frontend-codemeet.s3.amazonaws.com/index.html
```

**Should see:** Your React app (login page)
**Should NOT see:** XML error

---

## **Alternative: Command Line (AWS CLI)**

If you prefer terminal on your local machine:

### **1. Create policy file**

```bash
cat > bucket-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::online-compiler-frontend-codemeet/*"
    },
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      
```


## License: Apache-2.0
https://github.com/justinharringa/harringa.com/blob/e9d1c1bd35bc2c5cf62dba675aecb9ed3a9025dd/build/s3_test_bucket.tf

```
## **Step-by-Step: Apply Bucket Policy**

### **Step 1 — AWS Console (Easiest)**

1. Go to AWS Console → S3 → **online-compiler-frontend-codemeet**
2. Click **Permissions** tab
3. Scroll to **Bucket policy** → Click **Edit**
4. Delete any existing policy
5. Paste this exact policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::online-compiler-frontend-codemeet/*"
    },
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::online-compiler-frontend-codemeet/*",
      "Condition": {
        "ArnLike": {
          "AWS:SourceArn": [
            "arn:aws:cloudfront::319641750027:distribution/E2BFDQ1GVQH6KE",
            "arn:aws:cloudfront::319641750027:distribution/E4GMQAG8OJ9UG"
          ]
        }
      }
    }
  ]
}
```

6. Click **Save changes**

---

### **Step 2 — Disable Block Public Access**

Still in **Permissions** tab:

1. Click **Block public access (bucket settings)** → **Edit**
2. **Uncheck all 4 boxes:**
   - ☐ Block all public access
   - ☐ Block public access granted through new ACLs
   - ☐ Block public access granted through any ACLs
   - ☐ Block public access granted through new bucket policies
3. Click **Save changes**
4. Type `confirm` in popup → **Confirm**

---

### **Step 3 — Test Access**

Open in browser:
```
https://online-compiler-frontend-codemeet.s3.amazonaws.com/index.html
```

**Should see:** Your React app (login page)
**Should NOT see:** XML error

---

## **Alternative: Command Line (AWS CLI)**

If you prefer terminal on your local machine:

### **1. Create policy file**

```bash
cat > bucket-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::online-compiler-frontend-codemeet/*"
    },
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      
```


## License: unknown
https://github.com/albertlockett/website/blob/70421d9e03c451a9613b89d0be2c4774c40bbd7d/src/markdown-pages/post-1.md

```
## **Step-by-Step: Apply Bucket Policy**

### **Step 1 — AWS Console (Easiest)**

1. Go to AWS Console → S3 → **online-compiler-frontend-codemeet**
2. Click **Permissions** tab
3. Scroll to **Bucket policy** → Click **Edit**
4. Delete any existing policy
5. Paste this exact policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::online-compiler-frontend-codemeet/*"
    },
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::online-compiler-frontend-codemeet/*",
      "Condition": {
        "ArnLike": {
          "AWS:SourceArn": [
            "arn:aws:cloudfront::319641750027:distribution/E2BFDQ1GVQH6KE",
            "arn:aws:cloudfront::319641750027:distribution/E4GMQAG8OJ9UG"
          ]
        }
      }
    }
  ]
}
```

6. Click **Save changes**

---

### **Step 2 — Disable Block Public Access**

Still in **Permissions** tab:

1. Click **Block public access (bucket settings)** → **Edit**
2. **Uncheck all 4 boxes:**
   - ☐ Block all public access
   - ☐ Block public access granted through new ACLs
   - ☐ Block public access granted through any ACLs
   - ☐ Block public access granted through new bucket policies
3. Click **Save changes**
4. Type `confirm` in popup → **Confirm**

---

### **Step 3 — Test Access**

Open in browser:
```
https://online-compiler-frontend-codemeet.s3.amazonaws.com/index.html
```

**Should see:** Your React app (login page)
**Should NOT see:** XML error

---

## **Alternative: Command Line (AWS CLI)**

If you prefer terminal on your local machine:

### **1. Create policy file**

```bash
cat > bucket-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::online-compiler-frontend-codemeet/*"
    },
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      
```


## License: Apache-2.0
https://github.com/Sage-Bionetworks/Synapse-Stack-Builder/blob/c0ce9ac653ff0d91bf63a573d48a385b77cd5cf6/src/main/resources/templates/s3/s3-bucket-policy.json.vpt

```
## **Step-by-Step: Apply Bucket Policy**

### **Step 1 — AWS Console (Easiest)**

1. Go to AWS Console → S3 → **online-compiler-frontend-codemeet**
2. Click **Permissions** tab
3. Scroll to **Bucket policy** → Click **Edit**
4. Delete any existing policy
5. Paste this exact policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::online-compiler-frontend-codemeet/*"
    },
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::online-compiler-frontend-codemeet/*",
      "Condition": {
        "ArnLike": {
          "AWS:SourceArn": [
            "arn:aws:cloudfront::319641750027:distribution/E2BFDQ1GVQH6KE",
            "arn:aws:cloudfront::319641750027:distribution/E4GMQAG8OJ9UG"
          ]
        }
      }
    }
  ]
}
```

6. Click **Save changes**

---

### **Step 2 — Disable Block Public Access**

Still in **Permissions** tab:

1. Click **Block public access (bucket settings)** → **Edit**
2. **Uncheck all 4 boxes:**
   - ☐ Block all public access
   - ☐ Block public access granted through new ACLs
   - ☐ Block public access granted through any ACLs
   - ☐ Block public access granted through new bucket policies
3. Click **Save changes**
4. Type `confirm` in popup → **Confirm**

---

### **Step 3 — Test Access**

Open in browser:
```
https://online-compiler-frontend-codemeet.s3.amazonaws.com/index.html
```

**Should see:** Your React app (login page)
**Should NOT see:** XML error

---

## **Alternative: Command Line (AWS CLI)**

If you prefer terminal on your local machine:

### **1. Create policy file**

```bash
cat > bucket-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::online-compiler-frontend-codemeet/*"
    },
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::online-compiler-frontend-codemeet/*",
      "Condition": {
        "ArnLike":
```


## License: Apache-2.0
https://github.com/Sage-Bionetworks/Synapse-Stack-Builder/blob/c0ce9ac653ff0d91bf63a573d48a385b77cd5cf6/src/main/resources/templates/s3/s3-bucket-policy.json.vpt

```
## **Step-by-Step: Apply Bucket Policy**

### **Step 1 — AWS Console (Easiest)**

1. Go to AWS Console → S3 → **online-compiler-frontend-codemeet**
2. Click **Permissions** tab
3. Scroll to **Bucket policy** → Click **Edit**
4. Delete any existing policy
5. Paste this exact policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::online-compiler-frontend-codemeet/*"
    },
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::online-compiler-frontend-codemeet/*",
      "Condition": {
        "ArnLike": {
          "AWS:SourceArn": [
            "arn:aws:cloudfront::319641750027:distribution/E2BFDQ1GVQH6KE",
            "arn:aws:cloudfront::319641750027:distribution/E4GMQAG8OJ9UG"
          ]
        }
      }
    }
  ]
}
```

6. Click **Save changes**

---

### **Step 2 — Disable Block Public Access**

Still in **Permissions** tab:

1. Click **Block public access (bucket settings)** → **Edit**
2. **Uncheck all 4 boxes:**
   - ☐ Block all public access
   - ☐ Block public access granted through new ACLs
   - ☐ Block public access granted through any ACLs
   - ☐ Block public access granted through new bucket policies
3. Click **Save changes**
4. Type `confirm` in popup → **Confirm**

---

### **Step 3 — Test Access**

Open in browser:
```
https://online-compiler-frontend-codemeet.s3.amazonaws.com/index.html
```

**Should see:** Your React app (login page)
**Should NOT see:** XML error

---

## **Alternative: Command Line (AWS CLI)**

If you prefer terminal on your local machine:

### **1. Create policy file**

```bash
cat > bucket-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::online-compiler-frontend-codemeet/*"
    },
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::online-compiler-frontend-codemeet/*",
      "Condition": {
        "ArnLike":
```


## License: Apache-2.0
https://github.com/Sage-Bionetworks/Synapse-Stack-Builder/blob/c0ce9ac653ff0d91bf63a573d48a385b77cd5cf6/src/main/resources/templates/s3/s3-bucket-policy.json.vpt

```
## **Step-by-Step: Apply Bucket Policy**

### **Step 1 — AWS Console (Easiest)**

1. Go to AWS Console → S3 → **online-compiler-frontend-codemeet**
2. Click **Permissions** tab
3. Scroll to **Bucket policy** → Click **Edit**
4. Delete any existing policy
5. Paste this exact policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::online-compiler-frontend-codemeet/*"
    },
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::online-compiler-frontend-codemeet/*",
      "Condition": {
        "ArnLike": {
          "AWS:SourceArn": [
            "arn:aws:cloudfront::319641750027:distribution/E2BFDQ1GVQH6KE",
            "arn:aws:cloudfront::319641750027:distribution/E4GMQAG8OJ9UG"
          ]
        }
      }
    }
  ]
}
```

6. Click **Save changes**

---

### **Step 2 — Disable Block Public Access**

Still in **Permissions** tab:

1. Click **Block public access (bucket settings)** → **Edit**
2. **Uncheck all 4 boxes:**
   - ☐ Block all public access
   - ☐ Block public access granted through new ACLs
   - ☐ Block public access granted through any ACLs
   - ☐ Block public access granted through new bucket policies
3. Click **Save changes**
4. Type `confirm` in popup → **Confirm**

---

### **Step 3 — Test Access**

Open in browser:
```
https://online-compiler-frontend-codemeet.s3.amazonaws.com/index.html
```

**Should see:** Your React app (login page)
**Should NOT see:** XML error

---

## **Alternative: Command Line (AWS CLI)**

If you prefer terminal on your local machine:

### **1. Create policy file**

```bash
cat > bucket-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::online-compiler-frontend-codemeet/*"
    },
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::online-compiler-frontend-codemeet/*",
      "Condition": {
        "ArnLike":
```


## License: Apache-2.0
https://github.com/Sage-Bionetworks/Synapse-Stack-Builder/blob/c0ce9ac653ff0d91bf63a573d48a385b77cd5cf6/src/main/resources/templates/s3/s3-bucket-policy.json.vpt

```
## **Step-by-Step: Apply Bucket Policy**

### **Step 1 — AWS Console (Easiest)**

1. Go to AWS Console → S3 → **online-compiler-frontend-codemeet**
2. Click **Permissions** tab
3. Scroll to **Bucket policy** → Click **Edit**
4. Delete any existing policy
5. Paste this exact policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::online-compiler-frontend-codemeet/*"
    },
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::online-compiler-frontend-codemeet/*",
      "Condition": {
        "ArnLike": {
          "AWS:SourceArn": [
            "arn:aws:cloudfront::319641750027:distribution/E2BFDQ1GVQH6KE",
            "arn:aws:cloudfront::319641750027:distribution/E4GMQAG8OJ9UG"
          ]
        }
      }
    }
  ]
}
```

6. Click **Save changes**

---

### **Step 2 — Disable Block Public Access**

Still in **Permissions** tab:

1. Click **Block public access (bucket settings)** → **Edit**
2. **Uncheck all 4 boxes:**
   - ☐ Block all public access
   - ☐ Block public access granted through new ACLs
   - ☐ Block public access granted through any ACLs
   - ☐ Block public access granted through new bucket policies
3. Click **Save changes**
4. Type `confirm` in popup → **Confirm**

---

### **Step 3 — Test Access**

Open in browser:
```
https://online-compiler-frontend-codemeet.s3.amazonaws.com/index.html
```

**Should see:** Your React app (login page)
**Should NOT see:** XML error

---

## **Alternative: Command Line (AWS CLI)**

If you prefer terminal on your local machine:

### **1. Create policy file**

```bash
cat > bucket-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::online-compiler-frontend-codemeet/*"
    },
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::online-compiler-frontend-codemeet/*",
      "Condition": {
        "ArnLike":
```


## License: Apache-2.0
https://github.com/Sage-Bionetworks/Synapse-Stack-Builder/blob/c0ce9ac653ff0d91bf63a573d48a385b77cd5cf6/src/main/resources/templates/s3/s3-bucket-policy.json.vpt

```
## **Step-by-Step: Apply Bucket Policy**

### **Step 1 — AWS Console (Easiest)**

1. Go to AWS Console → S3 → **online-compiler-frontend-codemeet**
2. Click **Permissions** tab
3. Scroll to **Bucket policy** → Click **Edit**
4. Delete any existing policy
5. Paste this exact policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::online-compiler-frontend-codemeet/*"
    },
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::online-compiler-frontend-codemeet/*",
      "Condition": {
        "ArnLike": {
          "AWS:SourceArn": [
            "arn:aws:cloudfront::319641750027:distribution/E2BFDQ1GVQH6KE",
            "arn:aws:cloudfront::319641750027:distribution/E4GMQAG8OJ9UG"
          ]
        }
      }
    }
  ]
}
```

6. Click **Save changes**

---

### **Step 2 — Disable Block Public Access**

Still in **Permissions** tab:

1. Click **Block public access (bucket settings)** → **Edit**
2. **Uncheck all 4 boxes:**
   - ☐ Block all public access
   - ☐ Block public access granted through new ACLs
   - ☐ Block public access granted through any ACLs
   - ☐ Block public access granted through new bucket policies
3. Click **Save changes**
4. Type `confirm` in popup → **Confirm**

---

### **Step 3 — Test Access**

Open in browser:
```
https://online-compiler-frontend-codemeet.s3.amazonaws.com/index.html
```

**Should see:** Your React app (login page)
**Should NOT see:** XML error

---

## **Alternative: Command Line (AWS CLI)**

If you prefer terminal on your local machine:

### **1. Create policy file**

```bash
cat > bucket-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::online-compiler-frontend-codemeet/*"
    },
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::online-compiler-frontend-codemeet/*",
      "Condition": {
        "ArnLike":
```


## License: Apache-2.0
https://github.com/Sage-Bionetworks/Synapse-Stack-Builder/blob/c0ce9ac653ff0d91bf63a573d48a385b77cd5cf6/src/main/resources/templates/s3/s3-bucket-policy.json.vpt

```
## **Step-by-Step: Apply Bucket Policy**

### **Step 1 — AWS Console (Easiest)**

1. Go to AWS Console → S3 → **online-compiler-frontend-codemeet**
2. Click **Permissions** tab
3. Scroll to **Bucket policy** → Click **Edit**
4. Delete any existing policy
5. Paste this exact policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::online-compiler-frontend-codemeet/*"
    },
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::online-compiler-frontend-codemeet/*",
      "Condition": {
        "ArnLike": {
          "AWS:SourceArn": [
            "arn:aws:cloudfront::319641750027:distribution/E2BFDQ1GVQH6KE",
            "arn:aws:cloudfront::319641750027:distribution/E4GMQAG8OJ9UG"
          ]
        }
      }
    }
  ]
}
```

6. Click **Save changes**

---

### **Step 2 — Disable Block Public Access**

Still in **Permissions** tab:

1. Click **Block public access (bucket settings)** → **Edit**
2. **Uncheck all 4 boxes:**
   - ☐ Block all public access
   - ☐ Block public access granted through new ACLs
   - ☐ Block public access granted through any ACLs
   - ☐ Block public access granted through new bucket policies
3. Click **Save changes**
4. Type `confirm` in popup → **Confirm**

---

### **Step 3 — Test Access**

Open in browser:
```
https://online-compiler-frontend-codemeet.s3.amazonaws.com/index.html
```

**Should see:** Your React app (login page)
**Should NOT see:** XML error

---

## **Alternative: Command Line (AWS CLI)**

If you prefer terminal on your local machine:

### **1. Create policy file**

```bash
cat > bucket-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::online-compiler-frontend-codemeet/*"
    },
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::online-compiler-frontend-codemeet/*",
      "Condition": {
        "ArnLike":
```


## License: Apache-2.0
https://github.com/Sage-Bionetworks/Synapse-Stack-Builder/blob/c0ce9ac653ff0d91bf63a573d48a385b77cd5cf6/src/main/resources/templates/s3/s3-bucket-policy.json.vpt

```
## **Step-by-Step: Apply Bucket Policy**

### **Step 1 — AWS Console (Easiest)**

1. Go to AWS Console → S3 → **online-compiler-frontend-codemeet**
2. Click **Permissions** tab
3. Scroll to **Bucket policy** → Click **Edit**
4. Delete any existing policy
5. Paste this exact policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::online-compiler-frontend-codemeet/*"
    },
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::online-compiler-frontend-codemeet/*",
      "Condition": {
        "ArnLike": {
          "AWS:SourceArn": [
            "arn:aws:cloudfront::319641750027:distribution/E2BFDQ1GVQH6KE",
            "arn:aws:cloudfront::319641750027:distribution/E4GMQAG8OJ9UG"
          ]
        }
      }
    }
  ]
}
```

6. Click **Save changes**

---

### **Step 2 — Disable Block Public Access**

Still in **Permissions** tab:

1. Click **Block public access (bucket settings)** → **Edit**
2. **Uncheck all 4 boxes:**
   - ☐ Block all public access
   - ☐ Block public access granted through new ACLs
   - ☐ Block public access granted through any ACLs
   - ☐ Block public access granted through new bucket policies
3. Click **Save changes**
4. Type `confirm` in popup → **Confirm**

---

### **Step 3 — Test Access**

Open in browser:
```
https://online-compiler-frontend-codemeet.s3.amazonaws.com/index.html
```

**Should see:** Your React app (login page)
**Should NOT see:** XML error

---

## **Alternative: Command Line (AWS CLI)**

If you prefer terminal on your local machine:

### **1. Create policy file**

```bash
cat > bucket-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::online-compiler-frontend-codemeet/*"
    },
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::online-compiler-frontend-codemeet/*",
      "Condition": {
        "ArnLike":
```


## License: Apache-2.0
https://github.com/Sage-Bionetworks/Synapse-Stack-Builder/blob/c0ce9ac653ff0d91bf63a573d48a385b77cd5cf6/src/main/resources/templates/s3/s3-bucket-policy.json.vpt

```
## **Step-by-Step: Apply Bucket Policy**

### **Step 1 — AWS Console (Easiest)**

1. Go to AWS Console → S3 → **online-compiler-frontend-codemeet**
2. Click **Permissions** tab
3. Scroll to **Bucket policy** → Click **Edit**
4. Delete any existing policy
5. Paste this exact policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::online-compiler-frontend-codemeet/*"
    },
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::online-compiler-frontend-codemeet/*",
      "Condition": {
        "ArnLike": {
          "AWS:SourceArn": [
            "arn:aws:cloudfront::319641750027:distribution/E2BFDQ1GVQH6KE",
            "arn:aws:cloudfront::319641750027:distribution/E4GMQAG8OJ9UG"
          ]
        }
      }
    }
  ]
}
```

6. Click **Save changes**

---

### **Step 2 — Disable Block Public Access**

Still in **Permissions** tab:

1. Click **Block public access (bucket settings)** → **Edit**
2. **Uncheck all 4 boxes:**
   - ☐ Block all public access
   - ☐ Block public access granted through new ACLs
   - ☐ Block public access granted through any ACLs
   - ☐ Block public access granted through new bucket policies
3. Click **Save changes**
4. Type `confirm` in popup → **Confirm**

---

### **Step 3 — Test Access**

Open in browser:
```
https://online-compiler-frontend-codemeet.s3.amazonaws.com/index.html
```

**Should see:** Your React app (login page)
**Should NOT see:** XML error

---

## **Alternative: Command Line (AWS CLI)**

If you prefer terminal on your local machine:

### **1. Create policy file**

```bash
cat > bucket-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::online-compiler-frontend-codemeet/*"
    },
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::online-compiler-frontend-codemeet/*",
      "Condition": {
        "ArnLike":
```

