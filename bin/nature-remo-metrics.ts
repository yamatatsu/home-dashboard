#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { NatureRemoMetricsStack } from '../lib/nature-remo-metrics-stack';

const app = new cdk.App();
new NatureRemoMetricsStack(app, 'NatureRemoMetricsStack');
