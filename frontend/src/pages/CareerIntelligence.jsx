import { useEffect, useMemo, useState } from "react";

const API_BASE_URL = "http://127.0.0.1:8000";


// ============================================================
// HELPERS
// ============================================================

function safeArray(value) {
  if (Array.isArray(value)) {
    return value
      .filter((item) => item !== null && item !== undefined)
      .map((item) => String(item).trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}


function safeNumber(value, fallback = 0) {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
}


function clamp(value) {
  return Math.min(
    100,
    Math.max(
      0,
      safeNumber(value)
    )
  );
}


function formatSkillName(skill) {
  if (!skill) {
    return "";
  }

  const normalized = String(skill)
    .trim()
    .toLowerCase();

  const skillNames = {
    python: "Python",
    java: "Java",
    javascript: "JavaScript",
    js: "JavaScript",
    typescript: "TypeScript",
    ts: "TypeScript",

    html: "HTML",
    css: "CSS",

    react: "React",
    reactjs: "React",
    "react.js": "React",

    angular: "Angular",
    vue: "Vue",

    node: "Node.js",
    nodejs: "Node.js",
    "node.js": "Node.js",

    express: "Express.js",
    expressjs: "Express.js",
    "express.js": "Express.js",

    django: "Django",
    flask: "Flask",

    fastapi: "FastAPI",
    "fast api": "FastAPI",

    sql: "SQL",
    mysql: "MySQL",
    postgresql: "PostgreSQL",
    postgres: "PostgreSQL",
    mongodb: "MongoDB",
    "mongo db": "MongoDB",
    oracle: "Oracle",

    git: "Git",
    github: "GitHub",
    gitlab: "GitLab",

    docker: "Docker",
    kubernetes: "Kubernetes",

    aws: "AWS",
    azure: "Azure",
    gcp: "GCP",

    ec2: "EC2",
    s3: "S3",
    lambda: "Lambda",

    "rest api": "REST API",
    "rest apis": "REST API",
    restful: "REST API",

    jwt: "JWT",
    oauth: "OAuth",

    pandas: "Pandas",
    numpy: "NumPy",
    "scikit-learn": "Scikit-learn",
    sklearn: "Scikit-learn",

    tensorflow: "TensorFlow",
    pytorch: "PyTorch",

    "power bi": "Power BI",
    tableau: "Tableau",
    excel: "Excel",

    linux: "Linux",
    nginx: "Nginx",
    jenkins: "Jenkins",

    "ci/cd": "CI/CD",
    cicd: "CI/CD",

    kafka: "Kafka",
    hadoop: "Hadoop",
    spark: "Spark",

    rpa: "RPA",
  };

  if (skillNames[normalized]) {
    return skillNames[normalized];
  }

  return String(skill)
    .trim()
    .replace(/\b\w/g, (character) =>
      character.toUpperCase()
    );
}


function getScoreColor(score) {
  const value = clamp(score);

  if (value >= 80) {
    return "#16a34a";
  }

  if (value >= 65) {
    return "#2563eb";
  }

  if (value >= 50) {
    return "#d97706";
  }

  return "#dc2626";
}


function getScoreLabel(score) {
  const value = clamp(score);

  if (value >= 80) {
    return "Excellent Match";
  }

  if (value >= 65) {
    return "Good Match";
  }

  if (value >= 50) {
    return "Moderate Match";
  }

  return "Low Match";
}


function formatFileName(filename) {
  if (!filename) {
    return "Resume";
  }

  return String(filename);
}


function getPriorityStyle(priority) {
  const normalized = String(
    priority || "Medium"
  ).toLowerCase();

  if (normalized === "high") {
    return {
      background: "#fee2e2",
      color: "#b91c1c",
    };
  }

  if (normalized === "low") {
    return {
      background: "#dcfce7",
      color: "#166534",
    };
  }

  return {
    background: "#fef3c7",
    color: "#92400e",
  };
}


function normalizeLearningPath(value) {
  if (Array.isArray(value)) {
    return value
      .flatMap((item) => {
        if (typeof item === "string") {
          return item;
        }

        if (item && typeof item === "object") {
          return (
            item.step ||
            item.title ||
            item.name ||
            item.description ||
            ""
          );
        }

        return "";
      })
      .map((item) => String(item).trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    const cleaned = value
      .replace(/\r/g, "")
      .trim();

    if (!cleaned) {
      return [];
    }

    const numbered = cleaned
      .split(/\n/)
      .map((item) =>
        item
          .replace(/^\s*\d+[\].):-]\s*/, "")
          .trim()
      )
      .filter(Boolean);

    if (numbered.length > 1) {
      return numbered;
    }

    const sentenceParts = cleaned
      .split(
        /(?<=\.)\s+(?=[A-Z])/
      )
      .map((item) => item.trim())
      .filter(Boolean);

    if (sentenceParts.length > 1) {
      return sentenceParts;
    }

    const commonStepParts = cleaned
      .split(
        /(?=Build |Learn |Connect |Implement |Create |Practice |Deploy |Understand )/
      )
      .map((item) => item.trim())
      .filter(Boolean);

    if (commonStepParts.length > 1) {
      return commonStepParts;
    }

    return [cleaned];
  }

  return [];
}


// ============================================================
// SMALL COMPONENTS
// ============================================================

function SectionTitle({
  icon,
  title,
  subtitle,
  iconType = "default",
}) {
  let iconStyle = styles.sectionTitleIcon;

  if (iconType === "green") {
    iconStyle = {
      ...styles.sectionTitleIcon,
      ...styles.greenIcon,
    };
  }

  if (iconType === "red") {
    iconStyle = {
      ...styles.sectionTitleIcon,
      ...styles.redIcon,
    };
  }

  return (
    <div style={styles.sectionTitleRow}>
      <div style={iconStyle}>
        {icon}
      </div>

      <div>
        <h3 style={styles.cardTitle}>
          {title}
        </h3>

        {subtitle && (
          <p style={styles.cardSubtitle}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}


function TagList({
  items,
  variant = "blue",
}) {
  const values = safeArray(items);

  if (values.length === 0) {
    return (
      <div style={styles.emptyMessage}>
        No items found.
      </div>
    );
  }

  const uniqueValues = [
    ...new Map(
      values.map((item) => [
        formatSkillName(item).toLowerCase(),
        formatSkillName(item),
      ])
    ).values(),
  ];

  return (
    <div style={styles.tagList}>
      {uniqueValues.map((item) => {
        let background = "#dbeafe";
        let color = "#1d4ed8";

        if (variant === "green") {
          background = "#dcfce7";
          color = "#166534";
        }

        if (variant === "red") {
          background = "#fee2e2";
          color = "#b91c1c";
        }

        return (
          <span
            key={item}
            style={{
              ...styles.tag,
              background,
              color,
            }}
          >
            {item}
          </span>
        );
      })}
    </div>
  );
}


function ScoreBreakdownRow({
  label,
  value,
  weight,
}) {
  const score = clamp(value);
  const color = getScoreColor(score);

  return (
    <div style={styles.scoreBreakdownRow}>
      <div style={styles.scoreBreakdownHeader}>
        <div>
          <strong style={styles.scoreBreakdownLabel}>
            {label}
          </strong>

          <span style={styles.scoreWeight}>
            Weight: {weight}
          </span>
        </div>

        <strong
          style={{
            color,
            fontSize: "15px",
          }}
        >
          {score.toFixed(2)}%
        </strong>
      </div>

      <div style={styles.scoreBreakdownTrack}>
        <div
          style={{
            ...styles.scoreBreakdownFill,
            width: `${score}%`,
            background: color,
          }}
        />
      </div>
    </div>
  );
}


function RecommendationList({
  recommendations,
}) {
  const items = safeArray(
    recommendations
  );

  if (items.length === 0) {
    return (
      <div style={styles.successMessage}>
        Your resume is well aligned with
        the analyzed role.
      </div>
    );
  }

  return (
    <div style={styles.recommendationList}>
      {items.map((recommendation, index) => (
        <div
          key={`${recommendation}-${index}`}
          style={styles.recommendationItem}
        >
          <div style={styles.recommendationNumber}>
            {index + 1}
          </div>

          <div style={styles.recommendationText}>
            {recommendation}
          </div>
        </div>
      ))}
    </div>
  );
}


// ============================================================
// SKILL GAP SECTION
// ============================================================

function SkillGapSection({
  result,
  skillGapResult,
  score,
  strengths,
  missingSkills,
  skillGaps,
  recommendations,
}) {
  const jobName =
    result?.job_title ||
    "this role";

  const overallScore = clamp(
    result?.match_score ?? score
  );

  const skillCoverage = clamp(
    skillGapResult?.match_score ??
      skillGapResult?.skill_match ??
      skillGapResult?.score ??
      score
  );

  const normalizedStrengths =
    safeArray(
      strengths ??
        skillGapResult?.strengths
    );

  const normalizedMissingSkills = [
    ...new Map(
      safeArray(
        missingSkills ??
          skillGapResult?.missing_skills
      ).map((item) => [
        formatSkillName(item).toLowerCase(),
        formatSkillName(item),
      ])
    ).values(),
  ];

  const normalizedRecommendations =
    safeArray(
      recommendations ??
        skillGapResult?.recommendations
    );

  const rawGaps =
    Array.isArray(skillGaps)
      ? skillGaps
      : Array.isArray(
          skillGapResult?.skill_gaps
        )
      ? skillGapResult.skill_gaps
      : [];

  return (
    <section style={styles.skillGapSection}>
      <div style={styles.skillGapHeader}>
        <div style={styles.skillGapHeaderText}>
          <div style={styles.sectionEyebrow}>
            CAREER INTELLIGENCE
          </div>

          <h2 style={styles.skillGapTitle}>
            🎯 AI Skill Gap Analysis
          </h2>

          <p style={styles.skillGapDescription}>
            Discover what you already know,
            what you are missing and what you
            should learn next for{" "}
            <strong>{jobName}</strong>.
          </p>
        </div>

        <div style={styles.skillGapScore}>
          <span style={styles.scoreSmallLabel}>
            Skill Coverage
          </span>

          <strong
            style={{
              color:
                getScoreColor(
                  skillCoverage
                ),
              fontSize: "25px",
            }}
          >
            {skillCoverage.toFixed(2)}%
          </strong>

          <span style={styles.scoreTinyText}>
            Technical skill alignment
          </span>
        </div>
      </div>

      <div style={styles.twoColumn}>
        <div style={styles.innerCard}>
          <SectionTitle
            icon="✓"
            title="Your Strengths"
            subtitle="Areas already aligned with the role"
            iconType="green"
          />

          {normalizedStrengths.length > 0 ? (
            <div style={styles.verticalList}>
              {normalizedStrengths.map(
                (strength, index) => (
                  <div
                    key={`${strength}-${index}`}
                    style={styles.strengthItem}
                  >
                    <span>✓</span>

                    <span>
                      {strength}
                    </span>
                  </div>
                )
              )}
            </div>
          ) : (
            <div style={styles.emptyMessage}>
              No specific strengths were
              returned by the analysis.
            </div>
          )}
        </div>

        <div style={styles.innerCard}>
          <SectionTitle
            icon="!"
            title="Skills to Develop"
            subtitle="Skills detected in the job but not your resume"
            iconType="red"
          />

          {normalizedMissingSkills.length > 0 ? (
            <TagList
              items={
                normalizedMissingSkills
              }
              variant="red"
            />
          ) : (
            <div style={styles.successMessage}>
              No major technical skill gaps
              were identified.
            </div>
          )}
        </div>
      </div>

      <div style={styles.innerCard}>
        <SectionTitle
          icon="📚"
          title="Detailed Skill Gaps"
          subtitle="Priority and recommended learning path"
        />

        {rawGaps.length > 0 ? (
          <div style={styles.gapList}>
            {rawGaps.map((gap, index) => {
              const rawSkill =
                gap?.skill ||
                gap?.name ||
                gap?.title ||
                normalizedMissingSkills[
                  index
                ] ||
                `Skill Gap ${
                  index + 1
                }`;

              const skill =
                formatSkillName(
                  rawSkill
                );

              const priority =
                gap?.priority ||
                gap?.level ||
                "Medium";

              const why =
                gap?.reason ||
                gap?.why ||
                gap?.description ||
                `${skill} appears to be required by the job but was not detected in the selected resume.`;

              const learningPath =
                normalizeLearningPath(
                  gap?.learning_path ??
                    gap?.learningPath ??
                    gap?.path ??
                    gap?.steps
                );

              return (
                <div
                  key={`${skill}-${index}`}
                  style={styles.gapCard}
                >
                  <div style={styles.gapTop}>
                    <div>
                      <div
                        style={
                          styles.gapNumber
                        }
                      >
                        GAP{" "}
                        {String(
                          index + 1
                        ).padStart(
                          2,
                          "0"
                        )}
                      </div>

                      <h4
                        style={
                          styles.gapTitle
                        }
                      >
                        {skill}
                      </h4>
                    </div>

                    <span
                      style={{
                        ...styles.priorityBadge,
                        ...getPriorityStyle(
                          priority
                        ),
                      }}
                    >
                      {String(
                        priority
                      ).toUpperCase()}
                    </span>
                  </div>

                  <div
                    style={styles.gapText}
                  >
                    <strong>
                      Why:
                    </strong>{" "}
                    {why}
                  </div>

                  {learningPath.length >
                    0 && (
                    <div
                      style={
                        styles.learningPathContainer
                      }
                    >
                      <strong
                        style={
                          styles.learningPathTitle
                        }
                      >
                        🧭 Recommended
                        Learning Path
                      </strong>

                      <ol
                        style={
                          styles.learningPathList
                        }
                      >
                        {learningPath.map(
                          (
                            step,
                            stepIndex
                          ) => (
                            <li
                              key={`${skill}-step-${stepIndex}`}
                              style={
                                styles.learningPathItem
                              }
                            >
                              {step}
                            </li>
                          )
                        )}
                      </ol>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : normalizedMissingSkills.length >
          0 ? (
          <div
            style={
              styles.fallbackGapGrid
            }
          >
            {normalizedMissingSkills.map(
              (skill, index) => (
                <div
                  key={`${skill}-${index}`}
                  style={
                    styles.fallbackGap
                  }
                >
                  <strong>
                    {skill}
                  </strong>

                  <span>
                    This skill was identified
                    as missing for the
                    selected role.
                  </span>
                </div>
              )
            )}
          </div>
        ) : (
          <div style={styles.successMessage}>
            No detailed skill gaps were
            identified.
          </div>
        )}
      </div>

      <div style={styles.innerCard}>
        <SectionTitle
          icon="💡"
          title="Career Development Plan"
          subtitle={`Recommendations based on your ${overallScore.toFixed(
            2
          )}% overall job match`}
        />

        <RecommendationList
          recommendations={
            normalizedRecommendations
          }
        />
      </div>
    </section>
  );
}


// ============================================================
// MAIN COMPONENT
// ============================================================

function CareerIntelligence() {
  const [resumes, setResumes] =
    useState([]);

  const [selectedResumeId, setSelectedResumeId] =
    useState("");

  const [jobTitle, setJobTitle] =
    useState("");

  const [jobDescription, setJobDescription] =
    useState("");

  const [loadingResumes, setLoadingResumes] =
    useState(true);

  const [analyzing, setAnalyzing] =
    useState(false);

  const [result, setResult] =
    useState(null);

  const [skillGapResult, setSkillGapResult] =
    useState(null);

  const [skillGapLoading, setSkillGapLoading] =
    useState(false);

  const [skillGapWarning, setSkillGapWarning] =
    useState("");

  const [error, setError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");


  // ==========================================================
  // AUTH TOKEN
  // ==========================================================

  const token = useMemo(
    () =>
      localStorage.getItem(
        "hireintel_token"
      ),
    []
  );


  // ==========================================================
  // LOAD RESUMES
  // ==========================================================

  useEffect(() => {
    let cancelled = false;

    async function loadResumes() {
      try {
        if (!token) {
          if (!cancelled) {
            setError(
              "Please login before using Career Intelligence."
            );
            setLoadingResumes(false);
          }

          return;
        }

        const response =
          await fetch(
            `${API_BASE_URL}/resumes/my-resumes`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

        if (!response.ok) {
          if (
            response.status === 401
          ) {
            throw new Error(
              "Your session has expired. Please login again."
            );
          }

          throw new Error(
            "Unable to load your resumes."
          );
        }

        const data =
          await response.json();

        const resumeList =
          Array.isArray(data)
            ? data
            : Array.isArray(
                data?.resumes
              )
            ? data.resumes
            : [];

        if (!cancelled) {
          setResumes(
            resumeList
          );

          if (
            resumeList.length > 0
          ) {
            const latestResume =
              resumeList[0];

            setSelectedResumeId(
              String(
                latestResume.id
              )
            );
          }
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError?.message ||
              "Unable to load resumes."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingResumes(false);
        }
      }
    }

    void loadResumes();

    return () => {
      cancelled = true;
    };
  }, [token]);


  // ==========================================================
  // SELECTED RESUME
  // ==========================================================

  const selectedResume = useMemo(
    () =>
      resumes.find(
        (resume) =>
          String(resume.id) ===
          String(
            selectedResumeId
          )
      ),
    [
      resumes,
      selectedResumeId,
    ]
  );


  // ==========================================================
  // MAIN MATCH SCORE
  // ==========================================================

  const matchScore = clamp(
    result?.match_score
  );

  const matchLabel =
    result?.match_label ||
    getScoreLabel(
      matchScore
    );


  // ==========================================================
  // ANALYZE
  // ==========================================================

  async function analyzeJobDescription() {
    setError("");
    setSuccessMessage("");
    setSkillGapWarning("");
    setSkillGapResult(null);

    if (!token) {
      setError(
        "Please login before using Career Intelligence."
      );

      return;
    }

    if (!selectedResumeId) {
      setError(
        "Please select a resume."
      );

      return;
    }

    if (!jobDescription.trim()) {
      setError(
        "Please enter a job description."
      );

      return;
    }

    if (
      jobDescription.trim().length <
      20
    ) {
      setError(
        "Job description must contain at least 20 characters."
      );

      return;
    }

    setAnalyzing(true);

    try {
      const response =
        await fetch(
          `${API_BASE_URL}/career-intelligence/match-job-description`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({
              resume_id:
                Number(
                  selectedResumeId
                ),

              job_title:
                jobTitle.trim() ||
                null,

              job_description:
                jobDescription.trim(),
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            "Job description analysis failed."
        );
      }

      setResult(data);

      setSuccessMessage(
        "Job description analyzed successfully."
      );

      // --------------------------------------------------------
      // SKILL GAP ANALYSIS
      // --------------------------------------------------------

      setSkillGapLoading(true);

      try {
        const skillResponse =
          await fetch(
            `${API_BASE_URL}/career-intelligence/skill-gap`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body: JSON.stringify({
                resume_id:
                  Number(
                    selectedResumeId
                  ),

                job_title:
                  jobTitle.trim() ||
                  null,

                job_description:
                  jobDescription.trim(),
              }),
            }
          );

        const skillData =
          await skillResponse.json();

        if (!skillResponse.ok) {
          throw new Error(
            skillData?.detail ||
              "Skill gap analysis failed."
          );
        }

        setSkillGapResult(
          skillData
        );
      } catch (skillError) {
        setSkillGapWarning(
          skillError?.message ||
            "Skill gap analysis could not be completed."
        );
      } finally {
        setSkillGapLoading(false);
      }
    } catch (analysisError) {
      setResult(null);

      setError(
        analysisError?.message ||
          "Job description analysis failed."
      );
    } finally {
      setAnalyzing(false);
    }
  }


  // ==========================================================
  // RESET
  // ==========================================================

  function resetAnalysis() {
    setResult(null);
    setSkillGapResult(null);
    setSkillGapWarning("");
    setError("");
    setSuccessMessage("");
    setJobTitle("");
    setJobDescription("");
  }


  // ==========================================================
  // DERIVED DATA
  // ==========================================================

  const matchedSkills =
    safeArray(
      result?.matched_skills
    );

  const missingSkills =
    safeArray(
      result?.missing_skills
    );

  const matchedKeywords =
    safeArray(
      result?.matched_keywords
    );

  const missingKeywords =
    safeArray(
      result?.missing_keywords
    );

  const recommendations =
    safeArray(
      result?.recommendations
    );

  const experienceMatch =
    clamp(
      result?.experience_match
    );

  const strengths =
    safeArray(
      skillGapResult?.strengths
    );

  const skillGaps =
    Array.isArray(
      skillGapResult?.skill_gaps
    )
      ? skillGapResult.skill_gaps
      : [];

  const skillGapRecommendations =
    safeArray(
      skillGapResult?.recommendations
    );

  const scoreBreakdown =
    result?.score_breakdown ||
    {};


  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* ====================================================
            HEADER
        ==================================================== */}

        <header style={styles.header}>
          <div>
            <div style={styles.eyebrow}>
              CAREER INTELLIGENCE
            </div>

            <h1 style={styles.pageTitle}>
              AI Job Match Analyzer
            </h1>

            <p
              style={
                styles.pageSubtitle
              }
            >
              Compare your resume against
              any job description and discover
              your match score, strengths,
              missing skills and recommended
              career improvements.
            </p>
          </div>

          <div
            style={
              styles.headerBadge
            }
          >
            ✨ AI-Powered Analysis
          </div>
        </header>


        {/* ====================================================
            ANALYZER CARD
        ==================================================== */}

        <section
          style={
            styles.analyzerCard
          }
        >
          <div
            style={
              styles.sectionHeader
            }
          >
            <div>
              <div
                style={
                  styles.sectionEyebrow
                }
              >
                JOB MATCHING
              </div>

              <h2
                style={
                  styles.sectionTitle
                }
              >
                Analyze Your Fit
              </h2>

              <p
                style={
                  styles.sectionDescription
                }
              >
                Select your resume and paste
                any job description. HireIntel AI
                will calculate the compatibility
                score and identify skill gaps.
              </p>
            </div>

            <div
              style={styles.aiIcon}
            >
              ✨
            </div>
          </div>


          {/* RESUME */}

          <div style={styles.field}>
            <label
              htmlFor="resume-select"
              style={styles.label}
            >
              📄 Select Resume
            </label>

            {loadingResumes ? (
              <div
                style={
                  styles.loadingBox
                }
              >
                <span
                  style={
                    styles.spinner
                  }
                />

                Loading your resumes...
              </div>
            ) : resumes.length ===
              0 ? (
              <div
                style={
                  styles.warningBox
                }
              >
                <strong>
                  No resumes found
                </strong>

                <span>
                  Upload a resume before
                  using Career Intelligence.
                </span>
              </div>
            ) : (
              <select
                id="resume-select"
                value={
                  selectedResumeId
                }
                onChange={(event) =>
                  setSelectedResumeId(
                    event.target.value
                  )
                }
                style={styles.select}
              >
                <option value="">
                  Select a resume
                </option>

                {resumes.map(
                  (resume) => (
                    <option
                      key={resume.id}
                      value={
                        resume.id
                      }
                    >
                      {formatFileName(
                        resume.original_filename ||
                          resume.filename
                      )}
                    </option>
                  )
                )}
              </select>
            )}
          </div>


          {/* RESUME INFO */}

          {selectedResume && (
            <div
              style={
                styles.resumeInfo
              }
            >
              <div
                style={
                  styles.resumeInfoIcon
                }
              >
                📄
              </div>

              <div
                style={
                  styles.resumeInfoContent
                }
              >
                <strong>
                  {formatFileName(
                    selectedResume.original_filename ||
                      selectedResume.filename
                  )}
                </strong>

                <span>
                  Resume ID:{" "}
                  {selectedResume.id}
                </span>
              </div>

              {selectedResume.ai_score !==
                undefined &&
                selectedResume.ai_score !==
                  null && (
                  <span
                    style={
                      styles.resumeScoreBadge
                    }
                  >
                    Resume AI Score{" "}
                    {safeNumber(
                      selectedResume.ai_score
                    ).toFixed(0)}
                    %
                  </span>
                )}
            </div>
          )}


          {/* JOB TITLE */}

          <div style={styles.field}>
            <div
              style={
                styles.labelRow
              }
            >
              <label
                htmlFor="job-title"
                style={styles.label}
              >
                💼 Job Title{" "}
                <span
                  style={
                    styles.optional
                  }
                >
                  Optional
                </span>
              </label>
            </div>

            <input
              id="job-title"
              type="text"
              value={jobTitle}
              onChange={(event) =>
                setJobTitle(
                  event.target.value
                )
              }
              placeholder="e.g. Python Developer"
              style={styles.input}
            />
          </div>


          {/* JOB DESCRIPTION */}

          <div style={styles.field}>
            <div
              style={
                styles.labelRow
              }
            >
              <label
                htmlFor="job-description"
                style={styles.label}
              >
                📝 Job Description
              </label>

              <span
                style={
                  styles.characterCount
                }
              >
                {jobDescription.length}{" "}
                characters
              </span>
            </div>

            <textarea
              id="job-description"
              value={
                jobDescription
              }
              onChange={(event) =>
                setJobDescription(
                  event.target.value
                )
              }
              placeholder="Paste the complete job description here..."
              rows={9}
              style={styles.textarea}
            />

            <div
              style={
                styles.helperText
              }
            >
              Tip: Include the skills,
              responsibilities and experience
              requirements from the job posting
              for a more useful analysis.
            </div>
          </div>


          {/* ERROR */}

          {error && (
            <div
              style={styles.errorBox}
            >
              <span>⚠️</span>

              <span>
                {error}
              </span>
            </div>
          )}


          {/* SUCCESS */}

          {successMessage && (
            <div
              style={
                styles.successBanner
              }
            >
              ✓ {successMessage}
            </div>
          )}


          {/* BUTTON */}

          <button
            type="button"
            onClick={
              analyzeJobDescription
            }
            disabled={
              analyzing ||
              loadingResumes ||
              resumes.length === 0
            }
            style={{
              ...styles.analyzeButton,
              opacity:
                analyzing ||
                loadingResumes ||
                resumes.length === 0
                  ? 0.65
                  : 1,
              cursor:
                analyzing ||
                loadingResumes ||
                resumes.length === 0
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            {analyzing ? (
              <>
                <span
                  style={
                    styles.buttonSpinner
                  }
                />

                Analyzing Resume...
              </>
            ) : (
              <>
                ✨ Analyze Job Match
              </>
            )}
          </button>
        </section>


        {/* ====================================================
            RESULTS
        ==================================================== */}

        {result && (
          <div
            style={
              styles.resultsContainer
            }
          >

            {/* ==================================================
                HERO
            ================================================== */}

            <section
              style={
                styles.resultHero
              }
            >
              <div
                style={
                  styles.resultHeroLeft
                }
              >
                <div
                  style={
                    styles.resultEyebrow
                  }
                >
                  ✦ AI JOB MATCH RESULT
                </div>

                <h2
                  style={
                    styles.resultTitle
                  }
                >
                  {result.job_title ||
                    jobTitle ||
                    "Job Match Analysis"}
                </h2>

                <p
                  style={
                    styles.resultDescription
                  }
                >
                  Your resume was compared
                  with the role using technical
                  skills, keywords, text similarity
                  and experience.
                </p>

                <div
                  style={
                    styles.resultStats
                  }
                >
                  <div
                    style={
                      styles.miniStat
                    }
                  >
                    <strong>
                      {
                        matchedSkills.length
                      }
                    </strong>

                    <span>
                      Matched Skills
                    </span>
                  </div>

                  <div
                    style={
                      styles.miniStat
                    }
                  >
                    <strong>
                      {
                        missingSkills.length
                      }
                    </strong>

                    <span>
                      Skill Gaps
                    </span>
                  </div>

                  <div
                    style={
                      styles.miniStat
                    }
                  >
                    <strong>
                      {
                        matchedKeywords.length
                      }
                    </strong>

                    <span>
                      Matched Keywords
                    </span>
                  </div>
                </div>
              </div>


              <div
                style={
                  styles.scoreRingWrapper
                }
              >
                <div
                  style={{
                    ...styles.scoreRing,
                    background:
                      `conic-gradient(#2563eb ${matchScore * 3.6}deg, #e2e8f0 0deg)`,
                  }}
                >
                  <div
                    style={
                      styles.scoreRingInner
                    }
                  >
                    <strong
                      style={{
                        color:
                          getScoreColor(
                            matchScore
                          ),
                        fontSize:
                          "24px",
                      }}
                    >
                      {matchScore.toFixed(
                        2
                      )}
                      %
                    </strong>

                    <span
                      style={{
                        color:
                          "#64748b",
                        fontSize:
                          "12px",
                      }}
                    >
                      Match
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    ...styles.scoreLabel,
                    color:
                      "#2563eb",
                  }}
                >
                  {matchLabel}
                </div>
              </div>
            </section>


            {/* ==================================================
                SUMMARY
            ================================================== */}

            <section
              style={
                styles.whiteCard
              }
            >
              <SectionTitle
                icon="✦"
                title="AI Summary"
                subtitle="What the matching engine found"
              />

              <p
                style={
                  styles.bodyText
                }
              >
                {result.summary ||
                  `Your resume has a ${matchScore.toFixed(
                    2
                  )}% compatibility score with this role.`}
              </p>
            </section>


            {/* ==================================================
                WHY THIS SCORE
            ================================================== */}

            <section
              style={
                styles.whiteCard
              }
            >
              <SectionTitle
                icon="📊"
                title="Why This Score?"
                subtitle="Transparent breakdown of the HireIntel AI matching engine"
              />

              <div
                style={
                  styles.scoreBreakdown
                }
              >
                <ScoreBreakdownRow
                  label="Technical Skills"
                  value={
                    scoreBreakdown.skills
                  }
                  weight="40%"
                />

                <ScoreBreakdownRow
                  label="Keywords"
                  value={
                    scoreBreakdown.keywords
                  }
                  weight="20%"
                />

                <ScoreBreakdownRow
                  label="Text Similarity"
                  value={
                    scoreBreakdown.text_similarity
                  }
                  weight="25%"
                />

                <ScoreBreakdownRow
                  label="Experience Match"
                  value={
                    scoreBreakdown.experience
                  }
                  weight="15%"
                />
              </div>

              <div
                style={
                  styles.overallScoreExplanation
                }
              >
                <span>
                  Overall Job Match
                </span>

                <strong
                  style={{
                    color:
                      getScoreColor(
                        matchScore
                      ),
                  }}
                >
                  {matchScore.toFixed(
                    2
                  )}
                  %
                </strong>
              </div>
            </section>


            {/* ==================================================
                SKILLS
            ================================================== */}

            <div
              style={
                styles.twoColumn
              }
            >
              <section
                style={
                  styles.whiteCard
                }
              >
                <SectionTitle
                  icon="✓"
                  title="Matched Skills"
                  subtitle="Skills found in both resume and job"
                  iconType="green"
                />

                <TagList
                  items={
                    matchedSkills
                  }
                  variant="green"
                />
              </section>


              <section
                style={
                  styles.whiteCard
                }
              >
                <SectionTitle
                  icon="!"
                  title="Missing Skills"
                  subtitle="Skills required by the job but not detected"
                  iconType="red"
                />

                {missingSkills.length >
                0 ? (
                  <TagList
                    items={
                      missingSkills
                    }
                    variant="red"
                  />
                ) : (
                  <div
                    style={
                      styles.successMessage
                    }
                  >
                    ✓ No major skill
                    gaps detected.
                  </div>
                )}
              </section>
            </div>


            {/* ==================================================
                KEYWORDS
            ================================================== */}

            <section
              style={
                styles.whiteCard
              }
            >
              <SectionTitle
                icon="⌕"
                title="Keyword Intelligence"
                subtitle="Important terms detected across your resume and the job description"
              />

              <div
                style={
                  styles.keywordGrid
                }
              >
                <div>
                  <h4
                    style={
                      styles.subHeadingGreen
                    }
                  >
                    ✓ Matched Keywords
                  </h4>

                  {matchedKeywords.length >
                  0 ? (
                    <TagList
                      items={
                        matchedKeywords
                      }
                      variant="blue"
                    />
                  ) : (
                    <div
                      style={
                        styles.emptyMessage
                      }
                    >
                      No matched keywords
                      found.
                    </div>
                  )}
                </div>

                <div>
                  <h4
                    style={
                      styles.subHeadingRed
                    }
                  >
                    ⚠ Missing Keywords
                  </h4>

                  {missingKeywords.length >
                  0 ? (
                    <TagList
                      items={
                        missingKeywords
                      }
                      variant="red"
                    />
                  ) : (
                    <div
                      style={
                        styles.successMessage
                      }
                    >
                      No missing keywords
                      found.
                    </div>
                  )}
                </div>
              </div>
            </section>


            {/* ==================================================
                EXPERIENCE
            ================================================== */}

            <section
              style={
                styles.whiteCard
              }
            >
              <SectionTitle
                icon="💼"
                title="Experience Match"
                subtitle="How your detected experience aligns with the job requirement"
              />

              <div
                style={
                  styles.progressTrack
                }
              >
                <div
                  style={{
                    ...styles.progressFill,
                    width: `${experienceMatch}%`,
                    background:
                      getScoreColor(
                        experienceMatch
                      ),
                  }}
                />
              </div>

              <div
                style={
                  styles.progressFooter
                }
              >
                <span>
                  Experience Alignment
                </span>

                <strong
                  style={{
                    color:
                      getScoreColor(
                        experienceMatch
                      ),
                  }}
                >
                  {experienceMatch.toFixed(
                    2
                  )}
                  %
                </strong>
              </div>
            </section>


            {/* ==================================================
                RECOMMENDATIONS
            ================================================== */}

            <section
              style={
                styles.whiteCard
              }
            >
              <SectionTitle
                icon="💡"
                title="AI Recommendations"
                subtitle="Practical improvements based on this job match"
              />

              <RecommendationList
                recommendations={
                  recommendations
                }
              />
            </section>


            {/* ==================================================
                SKILL GAP
            ================================================== */}

            {skillGapLoading && (
              <section
                style={
                  styles.infoWarning
                }
              >
                <span
                  style={
                    styles.spinner
                  }
                />

                <div>
                  <strong>
                    AI Skill Gap Analysis
                    is running...
                  </strong>

                  <div>
                    We are identifying
                    missing skills and
                    preparing a learning path.
                  </div>
                </div>
              </section>
            )}


            {skillGapWarning && (
              <section
                style={
                  styles.infoWarning
                }
              >
                <span>
                  ⚠️
                </span>

                <div>
                  <strong>
                    Skill gap analysis
                    unavailable
                  </strong>

                  <div>
                    {skillGapWarning}
                  </div>
                </div>
              </section>
            )}


            {!skillGapLoading && (
              <SkillGapSection
                result={result}
                skillGapResult={
                  skillGapResult
                }
                score={matchScore}
                strengths={
                  strengths
                }
                missingSkills={
                  missingSkills
                }
                skillGaps={
                  skillGaps
                }
                recommendations={
                  skillGapRecommendations.length >
                  0
                    ? skillGapRecommendations
                    : recommendations
                }
              />
            )}


            {/* ==================================================
                ACTIONS
            ================================================== */}

            <div
              style={
                styles.finalActions
              }
            >
              <button
                type="button"
                onClick={
                  resetAnalysis
                }
                style={
                  styles.secondaryButton
                }
              >
                ↻ Analyze Another Job
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}


// ============================================================
// STYLES
// ============================================================

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(180deg,#f8fafc 0%,#eef2ff 100%)",
    color: "#172033",
    fontFamily:
      "Inter, Arial, Helvetica, sans-serif",
    padding:
      "40px 20px 70px",
    boxSizing: "border-box",
  },

  container: {
    maxWidth: "1180px",
    margin: "0 auto",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "25px",
    marginBottom: "28px",
    flexWrap: "wrap",
  },

  eyebrow: {
    color: "#6652e8",
    fontWeight: "800",
    fontSize: "12px",
    letterSpacing: "1.6px",
    marginBottom: "8px",
  },

  pageTitle: {
    margin: 0,
    color: "#172554",
    fontSize: "38px",
    fontWeight: "800",
    letterSpacing: "-1px",
  },

  pageSubtitle: {
    margin: "10px 0 0",
    maxWidth: "750px",
    color: "#64748b",
    fontSize: "16px",
    lineHeight: "1.7",
  },

  headerBadge: {
    padding: "10px 16px",
    borderRadius: "30px",
    background: "#f0edff",
    color: "#6652e8",
    fontSize: "13px",
    fontWeight: "700",
    border: "1px solid #ddd6fe",
  },

  analyzerCard: {
    background: "#ffffff",
    borderRadius: "22px",
    padding: "34px",
    boxShadow:
      "0 15px 45px rgba(15,23,42,0.08)",
    border: "1px solid #e5e7eb",
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    marginBottom: "28px",
  },

  sectionEyebrow: {
    color: "#6652e8",
    fontSize: "11px",
    fontWeight: "800",
    letterSpacing: "1.2px",
    marginBottom: "6px",
  },

  sectionTitle: {
    margin: 0,
    color: "#172554",
    fontSize: "25px",
    fontWeight: "800",
  },

  sectionDescription: {
    margin: "7px 0 0",
    color: "#64748b",
    lineHeight: "1.6",
  },

  aiIcon: {
    width: "55px",
    height: "55px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f0edff",
    fontSize: "25px",
  },

  field: {
    marginBottom: "22px",
  },

  label: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "9px",
    color: "#334155",
    fontWeight: "700",
    fontSize: "14px",
  },

  optional: {
    color: "#94a3b8",
    fontWeight: "500",
    fontSize: "12px",
  },

  labelRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  characterCount: {
    color: "#94a3b8",
    fontSize: "12px",
  },

  select: {
    width: "100%",
    padding: "14px",
    borderRadius: "11px",
    border: "1px solid #cbd5e1",
    fontSize: "15px",
    background: "#ffffff",
    color: "#1e293b",
    boxSizing: "border-box",
    outline: "none",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "14px",
    borderRadius: "11px",
    border: "1px solid #cbd5e1",
    fontSize: "15px",
    color: "#1e293b",
    outline: "none",
  },

  textarea: {
    width: "100%",
    boxSizing: "border-box",
    padding: "15px",
    borderRadius: "12px",
    border: "1px solid #cbd5e1",
    fontSize: "15px",
    color: "#1e293b",
    resize: "vertical",
    lineHeight: "1.65",
    fontFamily: "inherit",
    outline: "none",
  },

  helperText: {
    marginTop: "6px",
    color: "#94a3b8",
    fontSize: "12px",
  },

  loadingBox: {
    padding: "15px",
    background: "#f8fafc",
    borderRadius: "11px",
    color: "#64748b",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  spinner: {
    width: "16px",
    height: "16px",
    border: "2px solid #cbd5e1",
    borderTop: "2px solid #2563eb",
    borderRadius: "50%",
    display: "inline-block",
    animation:
      "hireintel-spin 1s linear infinite",
  },

  buttonSpinner: {
    width: "17px",
    height: "17px",
    border:
      "2px solid rgba(255,255,255,0.4)",
    borderTop: "2px solid #ffffff",
    borderRadius: "50%",
    display: "inline-block",
    animation:
      "hireintel-spin 1s linear infinite",
  },

  warningBox: {
    padding: "15px",
    background: "#fff7ed",
    border: "1px solid #fed7aa",
    borderRadius: "11px",
    color: "#c2410c",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },

  resumeInfo: {
    display: "flex",
    alignItems: "center",
    gap: "13px",
    marginTop: "-8px",
    marginBottom: "22px",
    padding: "13px 15px",
    borderRadius: "12px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    flexWrap: "wrap",
  },

  resumeInfoIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    background: "#eef2ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
  },

  resumeInfoContent: {
    flex: 1,
    minWidth: "200px",
    display: "flex",
    flexDirection: "column",
    gap: "3px",
    color: "#334155",
  },

  resumeScoreBadge: {
    padding: "7px 11px",
    borderRadius: "20px",
    background: "#dcfce7",
    color: "#166534",
    fontSize: "12px",
    fontWeight: "800",
    whiteSpace: "nowrap",
  },

  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "14px 16px",
    borderRadius: "11px",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#b91c1c",
    marginBottom: "20px",
    lineHeight: "1.5",
  },

  successBanner: {
    padding: "13px 15px",
    borderRadius: "11px",
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    color: "#166534",
    marginBottom: "20px",
    fontWeight: "700",
  },

  analyzeButton: {
    width: "100%",
    padding: "15px 20px",
    border: "none",
    borderRadius: "12px",
    background:
      "linear-gradient(135deg,#2563eb,#4f46e5)",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "750",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    boxShadow:
      "0 8px 20px rgba(37,99,235,0.25)",
  },

  resultsContainer: {
    marginTop: "30px",
  },

  resultHero: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "30px",
    padding: "35px",
    borderRadius: "22px",
    background:
      "linear-gradient(135deg,#172554,#312e81)",
    color: "#ffffff",
    marginBottom: "22px",
    boxShadow:
      "0 15px 40px rgba(30,41,99,0.18)",
    flexWrap: "wrap",
  },

  resultHeroLeft: {
    flex: 1,
    minWidth: "300px",
  },

  resultEyebrow: {
    color: "#a5b4fc",
    fontSize: "11px",
    fontWeight: "800",
    letterSpacing: "1.4px",
    marginBottom: "8px",
  },

  resultTitle: {
    margin: 0,
    fontSize: "30px",
    fontWeight: "800",
  },

  resultDescription: {
    color: "#c7d2fe",
    lineHeight: "1.65",
    maxWidth: "700px",
  },

  resultStats: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginTop: "22px",
  },

  miniStat: {
    padding: "11px 14px",
    borderRadius: "11px",
    background:
      "rgba(255,255,255,0.10)",
    border:
      "1px solid rgba(255,255,255,0.12)",
    display: "flex",
    flexDirection: "column",
    minWidth: "115px",
  },

  scoreRingWrapper: {
    width: "180px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },

  scoreRing: {
    width: "145px",
    height: "145px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  scoreRingInner: {
    width: "115px",
    height: "115px",
    borderRadius: "50%",
    background: "#ffffff",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },

  scoreLabel: {
    marginTop: "12px",
    fontSize: "14px",
    fontWeight: "800",
    textAlign: "center",
  },

  whiteCard: {
    background: "#ffffff",
    borderRadius: "18px",
    padding: "27px",
    boxShadow:
      "0 8px 28px rgba(15,23,42,0.06)",
    border: "1px solid #e5e7eb",
    marginBottom: "22px",
  },

  sectionTitleRow: {
    display: "flex",
    alignItems: "center",
    gap: "13px",
    marginBottom: "20px",
  },

  sectionTitleIcon: {
    width: "38px",
    height: "38px",
    borderRadius: "10px",
    background: "#eef2ff",
    color: "#4f46e5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
    flexShrink: 0,
  },

  greenIcon: {
    background: "#dcfce7",
    color: "#166534",
  },

  redIcon: {
    background: "#fee2e2",
    color: "#b91c1c",
  },

  cardTitle: {
    margin: 0,
    color: "#172554",
    fontSize: "18px",
  },

  cardSubtitle: {
    margin: "3px 0 0",
    color: "#94a3b8",
    fontSize: "12px",
  },

  bodyText: {
    margin: 0,
    color: "#475569",
    lineHeight: "1.8",
    fontSize: "15px",
  },

  twoColumn: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(320px,1fr))",
    gap: "22px",
  },

  tagList: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },

  tag: {
    padding: "8px 12px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "700",
  },

  emptyMessage: {
    padding: "14px",
    borderRadius: "10px",
    background: "#f8fafc",
    color: "#94a3b8",
    fontSize: "14px",
  },

  successMessage: {
    padding: "14px",
    borderRadius: "10px",
    background: "#f0fdf4",
    color: "#166534",
    fontWeight: "700",
  },

  keywordGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(300px,1fr))",
    gap: "30px",
  },

  subHeadingGreen: {
    color: "#166534",
    margin: "0 0 12px",
  },

  subHeadingRed: {
    color: "#b91c1c",
    margin: "0 0 12px",
  },

  progressTrack: {
    width: "100%",
    height: "13px",
    borderRadius: "20px",
    overflow: "hidden",
    background: "#e2e8f0",
  },

  progressFill: {
    height: "100%",
    borderRadius: "20px",
    transition:
      "width 0.7s ease",
  },

  progressFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "12px",
    color: "#64748b",
  },

  scoreBreakdown: {
    display: "grid",
    gap: "18px",
  },

  scoreBreakdownRow: {
    width: "100%",
  },

  scoreBreakdownHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
  },

  scoreBreakdownLabel: {
    display: "block",
    color: "#334155",
    fontSize: "14px",
  },

  scoreWeight: {
    display: "block",
    marginTop: "3px",
    color: "#94a3b8",
    fontSize: "11px",
  },

  scoreBreakdownTrack: {
    width: "100%",
    height: "9px",
    borderRadius: "20px",
    background: "#e2e8f0",
    overflow: "hidden",
  },

  scoreBreakdownFill: {
    height: "100%",
    borderRadius: "20px",
    transition:
      "width 0.6s ease",
  },

  overallScoreExplanation: {
    marginTop: "24px",
    paddingTop: "18px",
    borderTop:
      "1px solid #e2e8f0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    color: "#172554",
    fontSize: "17px",
  },

  recommendationList: {
    display: "grid",
    gap: "12px",
  },

  recommendationItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "15px",
    borderRadius: "12px",
    background: "#f8f7ff",
    border:
      "1px solid #ede9fe",
  },

  recommendationNumber: {
    minWidth: "27px",
    height: "27px",
    borderRadius: "50%",
    background: "#6652e8",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: "800",
  },

  recommendationText: {
    color: "#475569",
    lineHeight: "1.6",
    fontSize: "14px",
  },

  skillGapSection: {
    background:
      "linear-gradient(135deg,#eef2ff,#f5f3ff)",
    borderRadius: "22px",
    padding: "25px",
    border:
      "1px solid #c7d2fe",
    marginBottom: "22px",
  },

  skillGapHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "25px",
    padding: "10px 5px 25px",
    flexWrap: "wrap",
  },

  skillGapHeaderText: {
    flex: 1,
    minWidth: "280px",
  },

  skillGapTitle: {
    margin: "5px 0",
    color: "#172554",
    fontSize: "28px",
    fontWeight: "800",
  },

  skillGapDescription: {
    margin: 0,
    color: "#64748b",
    lineHeight: "1.6",
  },

  skillGapScore: {
    minWidth: "155px",
    padding: "17px",
    borderRadius: "15px",
    background: "#ffffff",
    textAlign: "center",
    boxShadow:
      "0 8px 25px rgba(79,70,229,0.10)",
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },

  scoreSmallLabel: {
    color: "#64748b",
    fontSize: "12px",
    fontWeight: "700",
  },

  scoreTinyText: {
    color: "#94a3b8",
    fontSize: "10px",
  },

  innerCard: {
    background: "#ffffff",
    borderRadius: "16px",
    padding: "24px",
    boxShadow:
      "0 5px 20px rgba(15,23,42,0.05)",
    marginBottom: "20px",
  },

  verticalList: {
    display: "grid",
    gap: "10px",
  },

  strengthItem: {
    display: "flex",
    gap: "9px",
    alignItems: "flex-start",
    padding: "12px",
    background: "#f0fdf4",
    color: "#166534",
    borderRadius: "10px",
    lineHeight: "1.5",
  },

  gapList: {
    display: "grid",
    gap: "13px",
  },

  gapCard: {
    padding: "20px",
    borderRadius: "14px",
    background: "#f8fafc",
    border:
      "1px solid #e2e8f0",
  },

  gapTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    flexWrap: "wrap",
  },

  gapNumber: {
    color: "#6652e8",
    fontSize: "10px",
    fontWeight: "800",
    letterSpacing: "1px",
    marginBottom: "3px",
  },

  gapTitle: {
    margin: 0,
    color: "#172554",
    fontSize: "19px",
  },

  priorityBadge: {
    padding: "7px 11px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "800",
  },

  gapText: {
    color: "#475569",
    lineHeight: "1.6",
    margin: "13px 0 0",
    fontSize: "14px",
  },

  learningPathContainer: {
    marginTop: "16px",
    padding: "17px",
    borderRadius: "12px",
    background: "#eef2ff",
    border:
      "1px solid #c7d2fe",
  },

  learningPathTitle: {
    display: "block",
    color: "#3730a3",
    fontSize: "14px",
    marginBottom: "10px",
  },

  learningPathList: {
    margin: 0,
    paddingLeft: "24px",
    color: "#475569",
  },

  learningPathItem: {
    padding: "5px 0",
    lineHeight: "1.5",
    fontSize: "14px",
  },

  fallbackGapGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(220px,1fr))",
    gap: "12px",
  },

  fallbackGap: {
    padding: "15px",
    borderRadius: "12px",
    background: "#fff7ed",
    border:
      "1px solid #fed7aa",
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    color: "#92400e",
  },

  infoWarning: {
    display: "flex",
    gap: "10px",
    padding: "13px 15px",
    borderRadius: "11px",
    background: "#fffbeb",
    border:
      "1px solid #fde68a",
    color: "#92400e",
    marginBottom: "20px",
  },

  finalActions: {
    textAlign: "center",
    padding: "8px 0 25px",
  },

  secondaryButton: {
    padding: "12px 22px",
    border:
      "1px solid #4f46e5",
    borderRadius: "11px",
    background: "#ffffff",
    color: "#4f46e5",
    fontWeight: "750",
    cursor: "pointer",
    fontSize: "14px",
  },
};


// ============================================================
// EXPORT
// ============================================================

export default CareerIntelligence;