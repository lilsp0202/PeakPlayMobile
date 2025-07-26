interface MatchStats {
  // Batting stats
  runs?: number;
  balls?: number;
  fours?: number;
  sixes?: number;
  dots?: number;
  notOut?: boolean;
  strikeRate?: number;
  
  // Bowling stats
  wickets?: number;
  overs?: number;
  maidens?: number;
  wides?: number;
  noBalls?: number;
  economyRate?: number;
  runsConceded?: number;
  
  // Fielding stats
  catches?: number;
  runOuts?: number;
  stumpings?: number;
}

interface MatchContext {
  matchType: string;
  result: string;
  role: string;
}

export class MatchRatingAlgorithm {
  /**
   * Calculate match rating based on performance statistics and context
   * Returns a rating between 1.0 and 10.0
   */
  static calculateRating(stats: MatchStats, context: MatchContext): number {
    const { role, matchType, result } = context;
    
    const baseRating = 5.0; // Start with average rating
    let performanceScore = 0;
    let contextMultiplier = 1.0;
    
    // Calculate performance score based on role
    switch (role) {
      case 'BATSMAN':
        performanceScore = this.calculateBattingScore(stats);
        break;
      case 'BOWLER':
        performanceScore = this.calculateBowlingScore(stats);
        break;
      case 'ALL_ROUNDER':
        performanceScore = this.calculateAllRounderScore(stats);
        break;
      case 'KEEPER':
        performanceScore = this.calculateKeeperScore(stats);
        break;
      default:
        performanceScore = this.calculateGeneralScore(stats);
    }
    
    // Apply context multipliers
    contextMultiplier *= this.getMatchTypeMultiplier(matchType);
    contextMultiplier *= this.getResultMultiplier(result);
    
    // Calculate final rating
    const finalRating = Math.min(10.0, Math.max(1.0, 
      baseRating + (performanceScore * contextMultiplier)
    ));
    
    return Math.round(finalRating * 10) / 10; // Round to 1 decimal place
  }
  
  /**
   * Calculate batting performance score (-3 to +5)
   */
  private static calculateBattingScore(stats: MatchStats): number {
    let score = 0;
    
    if (stats.runs !== undefined) {
      // Runs scoring (up to +3 points)
      if (stats.runs >= 50) score += 3;
      else if (stats.runs >= 30) score += 2;
      else if (stats.runs >= 15) score += 1;
      else if (stats.runs < 5) score -= 1;
      
      // Strike rate bonus/penalty (up to ±1 point)
      if (stats.balls && stats.balls > 0) {
        const strikeRate = (stats.runs / stats.balls) * 100;
        if (strikeRate >= 150) score += 1;
        else if (strikeRate >= 120) score += 0.5;
        else if (strikeRate < 60) score -= 1;
        else if (strikeRate < 80) score -= 0.5;
      }
      
      // Boundary percentage bonus (up to +1 point)
      if (stats.balls && stats.fours !== undefined && stats.sixes !== undefined) {
        const boundaryPercentage = ((stats.fours + stats.sixes) / stats.balls) * 100;
        if (boundaryPercentage >= 20) score += 1;
        else if (boundaryPercentage >= 15) score += 0.5;
      }
      
      // Not out bonus
      if (stats.notOut) score += 0.5;
    }
    
    return score;
  }
  
  /**
   * Calculate bowling performance score (-3 to +5)
   */
  private static calculateBowlingScore(stats: MatchStats): number {
    let score = 0;
    
    if (stats.wickets !== undefined) {
      // Wickets scoring (up to +3 points)
      if (stats.wickets >= 4) score += 3;
      else if (stats.wickets >= 3) score += 2;
      else if (stats.wickets >= 2) score += 1.5;
      else if (stats.wickets >= 1) score += 1;
      else score -= 0.5; // No wickets penalty
      
      // Economy rate bonus/penalty (up to ±2 points)
      if (stats.economyRate !== undefined) {
        if (stats.economyRate <= 4) score += 2;
        else if (stats.economyRate <= 6) score += 1;
        else if (stats.economyRate <= 8) score += 0;
        else if (stats.economyRate <= 10) score -= 1;
        else score -= 2;
      }
      
      // Maiden overs bonus
      if (stats.maidens && stats.maidens > 0) {
        score += stats.maidens * 0.5;
      }
      
      // Extras penalty
      if (stats.wides || stats.noBalls) {
        const totalExtras = (stats.wides || 0) + (stats.noBalls || 0);
        if (totalExtras > 5) score -= 1;
        else if (totalExtras > 2) score -= 0.5;
      }
    }
    
    return score;
  }
  
  /**
   * Calculate all-rounder performance score (-3 to +5)
   */
  private static calculateAllRounderScore(stats: MatchStats): number {
    const battingScore = this.calculateBattingScore(stats) * 0.6; // 60% weight
    const bowlingScore = this.calculateBowlingScore(stats) * 0.4; // 40% weight
    const fieldingBonus = this.calculateFieldingBonus(stats);
    
    return battingScore + bowlingScore + fieldingBonus;
  }
  
  /**
   * Calculate keeper performance score (-3 to +5)
   */
  private static calculateKeeperScore(stats: MatchStats): number {
    let score = this.calculateBattingScore(stats) * 0.7; // 70% weight on batting
    
    // Wicket-keeping specific bonuses
    if (stats.catches !== undefined) {
      if (stats.catches >= 3) score += 2;
      else if (stats.catches >= 2) score += 1.5;
      else if (stats.catches >= 1) score += 1;
    }
    
    if (stats.stumpings !== undefined && stats.stumpings > 0) {
      score += stats.stumpings * 1.5; // Stumpings are valuable
    }
    
    return score;
  }
  
  /**
   * Calculate general performance score for unknown roles (-3 to +5)
   */
  private static calculateGeneralScore(stats: MatchStats): number {
    const battingScore = this.calculateBattingScore(stats) * 0.5;
    const bowlingScore = this.calculateBowlingScore(stats) * 0.3;
    const fieldingBonus = this.calculateFieldingBonus(stats) * 0.2;
    
    return battingScore + bowlingScore + fieldingBonus;
  }
  
  /**
   * Calculate fielding bonus (0 to +1.5)
   */
  private static calculateFieldingBonus(stats: MatchStats): number {
    let bonus = 0;
    
    if (stats.catches !== undefined && stats.catches > 0) {
      bonus += stats.catches * 0.5;
    }
    
    if (stats.runOuts !== undefined && stats.runOuts > 0) {
      bonus += stats.runOuts * 0.75; // Run outs are more valuable
    }
    
    return Math.min(1.5, bonus);
  }
  
  /**
   * Get match type multiplier (0.8 to 1.3)
   */
  private static getMatchTypeMultiplier(matchType: string): number {
    switch (matchType) {
      case 'CHAMPIONSHIP':
      case 'TOURNAMENT': return 1.3;
      case 'LEAGUE': return 1.2;
      case 'FRIENDLY': return 1.0;
      case 'PRACTICE': return 0.8;
      default: return 1.0;
    }
  }
  
  /**
   * Get result multiplier (0.9 to 1.1)
   */
  private static getResultMultiplier(result: string): number {
    switch (result) {
      case 'WIN': return 1.1;
      case 'DRAW': return 1.0;
      case 'LOSS': return 0.9;
      default: return 1.0;
    }
  }
  
  /**
   * Get performance insights for display
   */
  static getPerformanceInsights(stats: MatchStats, context: MatchContext): string[] {
    const insights: string[] = [];
    const { role } = context;
    
    // Batting insights
    if (stats.runs !== undefined) {
      if (stats.runs >= 50) insights.push("Excellent batting performance");
      else if (stats.runs >= 30) insights.push("Good batting contribution");
      else if (stats.runs < 5) insights.push("Struggled with the bat");
      
      if (stats.balls && stats.balls > 0) {
        const strikeRate = (stats.runs / stats.balls) * 100;
        if (strikeRate >= 150) insights.push("Explosive strike rate");
        else if (strikeRate < 60) insights.push("Slow scoring rate");
      }
    }
    
    // Bowling insights
    if (stats.wickets !== undefined && (role === 'BOWLER' || role === 'ALL_ROUNDER')) {
      if (stats.wickets >= 3) insights.push("Outstanding bowling figures");
      else if (stats.wickets >= 1) insights.push("Contributed with the ball");
      
      if (stats.economyRate !== undefined) {
        if (stats.economyRate <= 4) insights.push("Economical bowling");
        else if (stats.economyRate > 10) insights.push("Expensive bowling");
      }
    }
    
    // Fielding insights
    const totalFielding = (stats.catches || 0) + (stats.runOuts || 0) + (stats.stumpings || 0);
    if (totalFielding >= 2) insights.push("Active in the field");
    
    return insights;
  }
} 