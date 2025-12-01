use neura_sdk::{Agent, Input};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
struct SecurityAnalysis {
    risk_score: u8,
    risk_level: String,
    issues: Vec<String>,
    recommendations: Vec<String>,
}

struct AdvancedScamDetector;

impl Agent for AdvancedScamDetector {
    fn run(&self, input: Input) -> String {
        let code = input.get_text().to_lowercase();
        
        let mut analysis = SecurityAnalysis {
            risk_score: 0,
            risk_level: "LOW".to_string(),
            issues: Vec::new(),
            recommendations: Vec::new(),
        };

        // Check for honeypot patterns
        if detect_honeypot(&code) {
            analysis.risk_score += 30;
            analysis.issues.push("Honeypot pattern detected".to_string());
        }

        // Check for rug pull patterns
        if detect_rugpull(&code) {
            analysis.risk_score += 40;
            analysis.issues.push("Rug pull pattern detected".to_string());
        }

        // Check for ownership risks
        if detect_ownership_risk(&code) {
            analysis.risk_score += 25;
            analysis.issues.push("Centralized ownership risk".to_string());
        }

        // Check for fee manipulation
        if detect_fee_manipulation(&code) {
            analysis.risk_score += 20;
            analysis.issues.push("Dynamic fee manipulation possible".to_string());
        }

        // Determine risk level
        analysis.risk_level = if analysis.risk_score >= 70 {
            "HIGH".to_string()
        } else if analysis.risk_score >= 40 {
            "MEDIUM".to_string()
        } else {
            "LOW".to_string()
        };

        // Add recommendations
        if analysis.risk_score > 60 {
            analysis.recommendations.push("AVOID: High scam probability".to_string());
        } else if analysis.risk_score > 30 {
            analysis.recommendations.push("CAUTION: Conduct thorough research".to_string());
        } else {
            analysis.recommendations.push("SAFE: Appears legitimate".to_string());
        }

        // Serialize to JSON
        serde_json::to_string(&analysis).unwrap_or_else(|_| "Analysis failed".to_string())
    }
}

fn detect_honeypot(code: &str) -> bool {
    let patterns = [
        "selllimit", "maxsell", "whitelistonly", "tradingenabled",
        "isblacklisted", "cantransfer", "allowedtransfer"
    ];
    
    patterns.iter().any(|&pattern| code.contains(pattern))
}

fn detect_rugpull(code: &str) -> bool {
    let patterns = [
        "mint(address,uint256)", "withdraweth", "drainliquidity",
        "emergencywithdraw", "withdrawtokens", "transferownership"
    ];
    
    patterns.iter().any(|&pattern| code.contains(pattern))
}

fn detect_ownership_risk(code: &str) -> bool {
    code.contains("onlyowner") && !code.contains("renounceownership")
}

fn detect_fee_manipulation(code: &str) -> bool {
    code.contains("setfee") || code.contains("updatetax") || code.contains("changefee")
}