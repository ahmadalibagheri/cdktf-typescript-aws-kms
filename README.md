## Documentation

* Explore the Terraform for Terraform [CLI](https://www.terraform.io/downloads.html) >= v1.0+
* Explore the Nodejs for npm [CLI](https://nodejs.org/en/) >= v14+
* Explore the Yarn for Yarn [CLI](https://classic.yarnpkg.com/en/docs/install#debian-stable) >= v1.21 (optional - NPM will work as an alternative)
* Explore the CDK for cdktf [CLI](https://github.com/hashicorp/terraform-cdk#build)


Add your AWS credentials as two environment variables, AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY, replacing AAAAAA with each respective values.
```shell
$ export AWS_ACCESS_KEY_ID=AAAAAA
$ export AWS_SECRET_ACCESS_KEY=AAAAA
```

# typescript-aws-kms

A CDK for Terraform application in TypeScript for kms configuraiton.

## Usage

Install project dependencies

```shell
yarn install
```

Generate CDK for Terraform constructs for Terraform provides and modules used in the project.

```bash
cdktf get
```

You can now edit the `main.ts` file if you want to modify any code.

```typescript
vim main.ts
import { Construct } from "constructs";
import { App, TerraformStack, TerraformOutput } from "cdktf";
import {
  AwsProvider,
  datasources,
  kms
} from "./.gen/providers/aws/";

class MyStack extends TerraformStack {
  constructor(scope: Construct, name: string) {
    super(scope, name);

    let ENV: string = "Devops";
    let COMPANY: string = "yourCompany";

    new AwsProvider(this, "Aws_provider", {
      region: "us-east-1",
    });

    const awsAccountid = new datasources.DataAwsCallerIdentity(this, "aws_id", {});

    const awskmsKey = new kms.KmsKey(this, "Aws_kms", {
      description: "Create KMS encryption for creating encryption on volume",
      enableKeyRotation: true,
      policy: `{
        "Version": "2012-10-17",
        "Statement": [
          {
            "Sid": "Enable IAM User Permissions",
            "Effect": "Allow",
            "Principal": {
              "AWS": "arn:aws:iam::${awsAccountid.id}:root"
          },
            "Action": [
              "kms:*"
            ],
            "Resource": [
              "*"
            ]
          },    {
            "Sid": "Allow autoscalling to use the key",
            "Effect": "Allow",
            "Principal": {
              "AWS": [
                "arn:aws:iam::${awsAccountid.id}:role/aws-service-role/autoscaling.amazonaws.com/AWSServiceRoleForAutoScaling"
              ]
            },
            "Action": [
                "kms:Create*",
                "kms:Describe*",
                "kms:Enable*",
                "kms:List*",
                "kms:Put*",
                "kms:Update*",
                "kms:Revoke*",
                "kms:Disable*",
                "kms:Get*",
                "kms:Delete*",
                "kms:TagResource",
                "kms:UntagResource",
                "kms:ScheduleKeyDeletion",
                "kms:CancelKeyDeletion"
            ],
            "Resource": "*"
          },{
            "Sid": "Allow use of the key",
            "Effect": "Allow",
            "Principal": {
                "AWS": [
                "arn:aws:iam::${awsAccountid.id}:role/aws-service-role/autoscaling.amazonaws.com/AWSServiceRoleForAutoScaling"
                ]
            },
            "Action": [
                "kms:Encrypt",
                "kms:Decrypt",
                "kms:ReEncrypt*",
                "kms:GenerateDataKey*",
                "kms:DescribeKey"
            ],
            "Resource": "*"
            },        {
              "Sid": "Allow attachment of persistent resources",
              "Effect": "Allow",
              "Principal": {
                  "AWS": [
              "arn:aws:iam::${awsAccountid.id}:role/aws-service-role/autoscaling.amazonaws.com/AWSServiceRoleForAutoScaling"
              ]
              },
              "Action": [
                  "kms:CreateGrant",
                  "kms:ListGrants",
                  "kms:RevokeGrant"
              ],
              "Resource": "*",
              "Condition": {
                  "Bool": {
                      "kms:GrantIsForAWSResource": "true"
                  }
              }
          }
        ]
      }`,
      tags: {
        Name: "CDKtf-TypeScript-Demo-KMS-key",
        Team: `${ENV}`,
        Company: `${COMPANY}`,
      },
    });

    new kms.KmsAlias(this, "Aws_kms_alies", {
      name: `alias/${ENV}`,
      targetKeyId: awskmsKey.id,
    });
    
    new TerraformOutput(this, "Aws_Kms_id", {
      value: awskmsKey.id,
    });
  }
}

const app = new App();
new MyStack(app, "cdktf-typescript-aws-kms");
app.synth();
```

Compile the TypeScript application

```bash
tsc
```
At this step you can run code with two different way:

# The first way:

Generate Terraform configuration

```bash
cdktf synth
```

The above command will create a folder called `cdktf.out` that contains all Terraform JSON configuration that was generated.

Run Terraform commands

```bash
cd cdktf.out
terraform init
terraform plan
terraform apply
```

# The second way:

Run cdktf commands

```bash
cdktf deploy
```
