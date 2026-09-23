from app.services.resume_analysis_service import analyze_resume


sample_text = """
Anurag Nitinkumar Aski

Full Stack Developer | RPA Automation Engineer

Technical Skills:
Python, Java, JavaScript, React.js, Node.js, Express.js,
MySQL, SQL, AWS, Docker, Git, GitHub, Power BI, RPA

Education:
B.Tech in Computer Science and Engineering

Experience:
RPA Automation Internship

Projects:
Academic ERP System
Health Guidance System
Mobile Price AI

Certifications:
AWS Cloud Foundation
Advanced Prompt Engineering
"""


result = analyze_resume(sample_text)


print("\n========================================")
print("       HIREINTEL AI RESUME ANALYSIS")
print("========================================")

print("\nSKILLS:")
print(result["skills"])

print("\nEDUCATION:")
print(result["education"])

print("\nEXPERIENCE:")
print(result["experience"])

print("\nPROJECTS:")
print(result["projects"])

print("\nCERTIFICATIONS:")
print(result["certifications"])

print("\nKEYWORDS:")
print(result["keywords"])

print("\nSUMMARY:")
print(result["summary"])

print("\nSTRENGTHS:")
print(result["strengths"])

print("\nWEAKNESSES:")
print(result["weaknesses"])

print("\nRECOMMENDATIONS:")
print(result["recommendations"])

print("\nRESUME SCORE:")
print(result["resume_score"])

print("\n========================================")
print("          ANALYSIS COMPLETE")
print("========================================")