import rubric from '../config/evaluation-rubric.v1.json';
import { EvaluationRecord, FindingRecord } from '../types';

export class EvaluationService {
  public static getRubric() {
    return rubric;
  }

  /**
   * Calculates overall weighted score based on category scores and rubric weights.
   */
  public static calculateOverallScore(categories: Array<{ key: string; score: number | null }>): number {
    let totalWeight = 0;
    let weightedSum = 0;

    for (const cat of categories) {
      const def = rubric.categories.find((c) => c.key === cat.key);
      const weight = def ? def.weight : 1 / 7;
      if (cat.score !== null && !isNaN(cat.score)) {
        weightedSum += cat.score * weight;
        totalWeight += weight;
      }
    }

    if (totalWeight === 0) return 0;
    return Math.round((weightedSum / totalWeight) * 10) / 10;
  }

  /**
   * Sorts and selects top 10 issues ranked by Severity x Impact.
   */
  public static rankTopIssues(findings: FindingRecord[], limit = 10): FindingRecord[] {
    const severityWeights: Record<string, number> = {
      critical: 5,
      high: 4,
      medium: 3,
      low: 2,
      info: 1,
    };

    return [...findings]
      .sort((a, b) => {
        const weightA = (severityWeights[a.severity] || 1) * (a.confidence || 1);
        const weightB = (severityWeights[b.severity] || 1) * (b.confidence || 1);
        return weightB - weightA;
      })
      .slice(0, limit);
  }
}
