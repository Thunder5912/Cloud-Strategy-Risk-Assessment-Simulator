// Risk Assessment Calculator
document.getElementById('assessBtn').addEventListener('click', assessRisk);

function assessRisk() {
    // Get all input values
    const cloudProvider = document.getElementById('cloudProvider').value;
    const deploymentModel = document.getElementById('deploymentModel').value;
    const dataClassification = document.getElementById('dataClassification').value;
    const workloadSize = parseInt(document.getElementById('workloadSize').value);
    const userCount = parseInt(document.getElementById('userCount').value);
    const complianceReq = document.getElementById('complianceReq').value;
    const industryType = document.getElementById('industryType').value;
    
    // Get security measures
    const encryption = document.getElementById('encryption').checked;
    const mfa = document.getElementById('mfa').checked;
    const backup = document.getElementById('backup').checked;
    const monitoring = document.getElementById('monitoring').checked;
    const firewall = document.getElementById('firewall').checked;
    
    // Calculate risk scores
    let baseRisk = 50;
    let securityRisk = 50;
    let complianceRisk = 50;
    let costRisk = 50;
    
    // Cloud Provider Risk
    const providerRisk = {
        'aws': -5,
        'azure': -5,
        'gcp': -5,
        'multicloud': 10
    };
    baseRisk += providerRisk[cloudProvider];
    
    // Deployment Model Risk
    const deploymentRisk = {
        'public': 10,
        'private': -10,
        'hybrid': 0
    };
    baseRisk += deploymentRisk[deploymentModel];
    
    // Data Classification Risk
    const dataRisk = {
        'public': -10,
        'internal': 0,
        'confidential': 15,
        'restricted': 25
    };
    baseRisk += dataRisk[dataClassification];
    securityRisk += dataRisk[dataClassification];
    
    // Workload Size Risk
    if (workloadSize > 10000) {
        costRisk += 15;
        baseRisk += 5;
    } else if (workloadSize > 5000) {
        costRisk += 10;
    }
    
    // User Count Risk
    if (userCount > 10000) {
        securityRisk += 15;
        costRisk += 10;
    } else if (userCount > 1000) {
        securityRisk += 10;
        costRisk += 5;
    }
    
    // Compliance Requirements Risk
    const complianceRiskValue = {
        'none': -10,
        'gdpr': 15,
        'hipaa': 20,
        'pci': 18,
        'sox': 15,
        'multiple': 25
    };
    complianceRisk += complianceRiskValue[complianceReq];
    baseRisk += complianceRiskValue[complianceReq] * 0.5;
    
    // Industry Type Risk
    const industryRisk = {
        'general': 0,
        'finance': 20,
        'healthcare': 20,
        'government': 25,
        'ecommerce': 15,
        'education': 10
    };
    baseRisk += industryRisk[industryType] * 0.5;
    complianceRisk += industryRisk[industryType] * 0.3;
    
    // Security Measures (reduce risk)
    let securityMeasures = 0;
    if (encryption) securityMeasures++;
    if (mfa) securityMeasures++;
    if (backup) securityMeasures++;
    if (monitoring) securityMeasures++;
    if (firewall) securityMeasures++;
    
    const securityReduction = securityMeasures * 8;
    securityRisk -= securityReduction;
    baseRisk -= securityReduction * 0.5;
    
    // Normalize scores (0-100)
    baseRisk = Math.max(0, Math.min(100, baseRisk));
    securityRisk = Math.max(0, Math.min(100, securityRisk));
    complianceRisk = Math.max(0, Math.min(100, complianceRisk));
    costRisk = Math.max(0, Math.min(100, costRisk));
    
    // Calculate overall score
    const overallRisk = Math.round((baseRisk + securityRisk + complianceRisk + costRisk) / 4);
    
    // Display results
    displayResults(overallRisk, securityRisk, complianceRisk, costRisk, securityMeasures);
    
    // Generate recommendations
    generateRecommendations(overallRisk, securityRisk, complianceRisk, costRisk, securityMeasures, dataClassification, complianceReq);
}

function displayResults(overall, security, compliance, cost) {
    // Show results section
    document.getElementById('resultsSection').style.display = 'block';
    document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
    
    // Update risk meter
    const riskFill = document.getElementById('riskFill');
    const riskLabel = document.getElementById('riskLabel');
    
    riskFill.style.width = overall + '%';
    riskLabel.textContent = overall + '% Risk - ' + getRiskLevel(overall);
    
    // Update metric cards
    document.getElementById('overallScore').textContent = overall;
    document.getElementById('securityScore').textContent = Math.round(security);
    document.getElementById('complianceScore').textContent = Math.round(compliance);
    document.getElementById('costScore').textContent = Math.round(cost);
    
    // Create visual breakdown
    createRiskBreakdown(security, compliance, cost);
}

function getRiskLevel(score) {
    if (score < 30) return 'Low Risk';
    if (score < 50) return 'Moderate Risk';
    if (score < 70) return 'High Risk';
    return 'Critical Risk';
}

function createRiskBreakdown(security, compliance, cost) {
    const chartContainer = document.getElementById('riskChart').parentElement;
    
    // Remove existing chart if any
    const existingBars = chartContainer.querySelectorAll('.risk-category');
    existingBars.forEach(bar => bar.remove());
    
    // Create new breakdown
    const categories = [
        { name: 'Security Risk', value: Math.round(security) },
        { name: 'Compliance Risk', value: Math.round(compliance) },
        { name: 'Cost Risk', value: Math.round(cost) }
    ];
    
    categories.forEach(cat => {
        const div = document.createElement('div');
        div.className = 'risk-category';
        div.innerHTML = `
            <span style="flex: 1; font-weight: 600;">${cat.name}</span>
            <div style="flex: 2; background: #e0e0e0; border-radius: 10px; height: 20px; overflow: hidden;">
                <div class="risk-bar" style="width: ${cat.value}%"></div>
            </div>
            <span style="flex: 0 0 50px; text-align: right; font-weight: bold;">${cat.value}%</span>
        `;
        chartContainer.insertBefore(div, document.getElementById('riskChart'));
    });
    
    // Hide the canvas
    document.getElementById('riskChart').style.display = 'none';
}

function generateRecommendations(overall, security, compliance, cost, securityMeasures, dataClass, complianceReq) {
    const recommendationsDiv = document.getElementById('recommendations');
    let recommendations = '<h3>🎯 Recommendations</h3><ul>';
    
    // Security recommendations
    if (security > 50) {
        recommendations += '<li><strong>Security Enhancement:</strong> Your security risk is high. Implement additional security measures immediately.</li>';
        
        if (!document.getElementById('encryption').checked) {
            recommendations += '<li>Enable end-to-end encryption for data at rest and in transit.</li>';
        }
        if (!document.getElementById('mfa').checked) {
            recommendations += '<li>Implement Multi-Factor Authentication for all users.</li>';
        }
        if (!document.getElementById('monitoring').checked) {
            recommendations += '<li>Set up 24/7 security monitoring and incident response.</li>';
        }
    }
    
    // Compliance recommendations
    if (compliance > 50) {
        recommendations += '<li><strong>Compliance Focus:</strong> Ensure your cloud provider offers compliance certifications for ' + complianceReq.toUpperCase() + '.</li>';
        recommendations += '<li>Conduct regular compliance audits and maintain documentation.</li>';
        recommendations += '<li>Implement data residency controls based on regulatory requirements.</li>';
    }
    
    // Cost recommendations
    if (cost > 50) {
        recommendations += '<li><strong>Cost Optimization:</strong> Consider implementing auto-scaling and reserved instances.</li>';
        recommendations += '<li>Set up cost monitoring and alerting to prevent budget overruns.</li>';
        recommendations += '<li>Review and optimize resource allocation regularly.</li>';
    }
    
    // Data classification recommendations
    if (dataClass === 'restricted' || dataClass === 'confidential') {
        recommendations += '<li><strong>Data Protection:</strong> Implement data loss prevention (DLP) tools.</li>';
        recommendations += '<li>Consider using private cloud or dedicated instances for sensitive data.</li>';
    }
    
    // General recommendations
    if (overall > 60) {
        recommendations += '<li><strong>Risk Management:</strong> Develop a comprehensive disaster recovery and business continuity plan.</li>';
        recommendations += '<li>Conduct regular security assessments and penetration testing.</li>';
    }
    
    if (securityMeasures < 3) {
        recommendations += '<li><strong>Security Baseline:</strong> You have implemented only ' + securityMeasures + ' security measures. Aim for at least 4 out of 5.</li>';
    }
    
    recommendations += '<li><strong>Best Practice:</strong> Regularly review and update your cloud security policies.</li>';
    recommendations += '<li><strong>Training:</strong> Provide cloud security training to your IT staff and end users.</li>';
    
    recommendations += '</ul>';
    recommendationsDiv.innerHTML = recommendations;
}

// Add some interactivity - real-time updates
const inputs = document.querySelectorAll('select, input');
inputs.forEach(input => {
    input.addEventListener('change', function() {
        // Add a subtle animation to show something changed
        this.style.transform = 'scale(1.02)';
        setTimeout(() => {
            this.style.transform = 'scale(1)';
        }, 200);
    });
});
