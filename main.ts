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
