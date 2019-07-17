#!/usr/bin/env node
import 'source-map-support/register';
import cdk = require('@aws-cdk/core');
import { AmazonConnectExtendedOperationTimeStack } from '../lib/amazon_connect-extended-operation_time-stack';

const app = new cdk.App();
new AmazonConnectExtendedOperationTimeStack(app, 'AmazonConnectExtendedOperationTimeStack');
