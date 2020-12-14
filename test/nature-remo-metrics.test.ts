import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as NatureRemoMetrics from '../lib/nature-remo-metrics-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new NatureRemoMetrics.NatureRemoMetricsStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
