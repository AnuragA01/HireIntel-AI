import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://127.0.0.1:8000";

/* =========================================================
   HELPER FUNCTIONS
========================================================= */

function firstDefined(...values) {
  return values.find(
    (value) =>
      value !== undefined &&
      value !== null &&
      value !== ""
  );
}

function toArray(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function getErrorMessage(
  data,
  fallback = "Something went wrong."
) {
  if (typeof data?.detail === "string") {
    return data.detail;
  }

  if (Array.isArray(data?.detail)) {
    return data.detail
      .map((item) => {
        if (typeof item === "string") {
          return item;
        }

        return (
          item?.msg ||
          item?.message ||
          "Invalid request."
        );
      })
      .join(", ");
  }

  if (data?.detail) {
    if (typeof data.detail === "object") {
      return (
        data.detail.message ||
        data.detail.error ||
        JSON.stringify(data.detail)
      );
    }

    return String(data.detail);
  }

  return fallback;
}

/* =========================================================
   CANDIDATE HELPERS
========================================================= */

function getCandidateId(candidate) {
  return firstDefined(
    candidate?.candidate_id,
    candidate?.user_id,
    candidate?.candidate?.id,
    candidate?.user?.id,
    candidate?.id
  );
}

function getResumeId(candidate) {
  return firstDefined(
    candidate?.resume_id,
    candidate?.resume?.id,
    candidate?.candidate?.resume_id
  );
}

function getCandidateName(candidate) {
  return firstDefined(
    candidate?.candidate_name,
    candidate?.full_name,
    candidate?.name,
    candidate?.candidate?.full_name,
    candidate?.candidate?.name,
    candidate?.user?.full_name,
    candidate?.user?.name,
    "Candidate"
  );
}

function getCandidateEmail(candidate) {
  return firstDefined(
    candidate?.candidate_email,
    candidate?.email,
    candidate?.candidate?.email,
    candidate?.user?.email,
    "Email not available"
  );
}

function getMatchScore(candidate) {
  return Number(
    firstDefined(
      candidate?.match_score,
      candidate?.ai_match_score,
      candidate?.ai_match,
      candidate?.score,
      candidate?.match?.match_score,
      candidate?.match?.score,
      0
    )
  );
}

function getExperienceMatch(candidate) {
  return Number(
    firstDefined(
      candidate?.experience_match,
      candidate?.experience_score,
      candidate?.experience_match_score,
      candidate?.match?.experience_match,
      0
    )
  );
}

function getMatchedSkills(candidate) {
  return toArray(
    firstDefined(
      candidate?.matched_skills,
      candidate?.skills_matched,
      candidate?.matching_skills,
      candidate?.match?.matched_skills,
      candidate?.match?.skills_matched
    )
  );
}

function getMissingSkills(candidate) {
  return toArray(
    firstDefined(
      candidate?.missing_skills,
      candidate?.skills_missing,
      candidate?.missing_required_skills,
      candidate?.match?.missing_skills,
      candidate?.match?.skills_missing
    )
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

function RecruiterCandidateMatches() {
  const navigate = useNavigate();

  /* =======================================================
     STATE
  ======================================================= */

  const [jobs, setJobs] = useState([]);

  const [selectedJobId, setSelectedJobId] =
    useState("");

  const [candidates, setCandidates] =
    useState([]);

  const [loadingJobs, setLoadingJobs] =
    useState(true);

  const [loadingCandidates, setLoadingCandidates] =
    useState(false);

  const [error, setError] =
    useState("");

  const [sortOrder, setSortOrder] =
    useState("high");

  /* =======================================================
     LOGOUT
  ======================================================= */

  const logout = useCallback(() => {
    localStorage.removeItem(
      "hireintel_token"
    );

    navigate(
      "/login",
      {
        replace: true,
      }
    );
  }, [navigate]);

  /* =======================================================
     API REQUEST FUNCTION

     IMPORTANT:
     No "throw new Error()".
     This avoids the editor error you are seeing.
  ======================================================= */

  const fetchJson = useCallback(
    async (url) => {
      const token =
        localStorage.getItem(
          "hireintel_token"
        );

      if (!token) {
        logout();

        return {
          success: false,
          data: null,
          error: "Authentication required.",
        };
      }

      try {
        const response = await fetch(
          url,
          {
            method: "GET",

            headers: {
              Authorization:
                `Bearer ${token}`,

              Accept:
                "application/json",
            },
          }
        );

        const data =
          await response
            .json()
            .catch(() => null);

        /* =============================================
           UNAUTHORIZED
        ============================================= */

        if (response.status === 401) {
          logout();

          return {
            success: false,
            data: null,
            error: "Session expired.",
          };
        }

        /* =============================================
           SERVER ERROR
        ============================================= */

        if (!response.ok) {
          return {
            success: false,
            data,
            error: getErrorMessage(
              data,
              `Request failed with status ${response.status}.`
            ),
          };
        }

        /* =============================================
           SUCCESS
        ============================================= */

        return {
          success: true,
          data,
          error: "",
        };
      } catch (networkError) {
        console.error(
          "Network request error:",
          networkError
        );

        return {
          success: false,
          data: null,
          error:
            "Unable to connect to HireIntel AI server. Make sure the FastAPI backend is running on port 8000.",
        };
      }
    },
    [logout]
  );

  /* =======================================================
     LOAD RECRUITER JOBS
  ======================================================= */

  const loadJobs = useCallback(
    async () => {
      setLoadingJobs(true);
      setError("");

      const result =
        await fetchJson(
          `${API_BASE_URL}/dashboard/recruiter`
        );

      if (!result.success) {
        setError(
          result.error ||
            "Unable to load recruiter jobs."
        );

        setLoadingJobs(false);

        return;
      }

      const data = result.data;

      const recruiterJobs =
        Array.isArray(data?.jobs)
          ? data.jobs
          : [];

      setJobs(recruiterJobs);

      if (
        recruiterJobs.length > 0
      ) {
        const firstJobId =
          firstDefined(
            recruiterJobs[0]?.job_id,
            recruiterJobs[0]?.id
          );

        if (firstJobId) {
          setSelectedJobId(
            String(firstJobId)
          );
        }
      } else {
        setSelectedJobId("");
        setCandidates([]);
        }

      setLoadingJobs(false);
    },
    [fetchJson]
  );

  /* =======================================================
     LOAD CANDIDATE MATCHES
  ======================================================= */

  const loadCandidates =
    useCallback(
      async (jobId) => {
        if (!jobId) {
          setCandidates([]);
          return;
        }

        setLoadingCandidates(true);
        setError("");

        const result =
          await fetchJson(
            `${API_BASE_URL}/recruiter/jobs/${jobId}/candidates`
          );

        if (!result.success) {
          setCandidates([]);

          setError(
            result.error ||
              "Unable to load candidate matches."
          );

          setLoadingCandidates(false);

          return;
        }

        const data = result.data;

        const candidateList =
          Array.isArray(data)
            ? data
            : Array.isArray(
                data?.candidates
              )
            ? data.candidates
            : Array.isArray(
                data?.matches
              )
            ? data.matches
            : [];

        setCandidates(
          candidateList
        );

        setLoadingCandidates(false);
      },
      [fetchJson]
    );

  /* =======================================================
     INITIAL PAGE LOAD
  ======================================================= */

  useEffect(() => {
    const timer =
      window.setTimeout(() => {
        loadJobs();
      }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [loadJobs]);

  /* =======================================================
     LOAD DATA WHEN JOB CHANGES
  ======================================================= */

  useEffect(() => {
    if (!selectedJobId) {
      return;
    }

    const timer =
      window.setTimeout(() => {
        loadCandidates(selectedJobId);
      }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    selectedJobId,
    loadCandidates,
  ]);

  /* =======================================================
     SELECTED JOB
  ======================================================= */

  const selectedJob =
    useMemo(() => {
      return jobs.find(
        (job) =>
          String(
            firstDefined(
              job?.job_id,
              job?.id
            )
          ) ===
          String(selectedJobId)
      );
    }, [
      jobs,
      selectedJobId,
    ]);

  /* =======================================================
     NORMALIZE CANDIDATES
  ======================================================= */

  const normalizedCandidates =
    useMemo(() => {
      return candidates.map(
        (
          candidate,
          index
        ) => {
          const candidateId =
            getCandidateId(
              candidate
            );

          const status =
            firstDefined(
              candidate?.application_status,
              candidate?.application?.status,
              candidate?.status,
              "Not Applied"
            );

          const candidateScore =
            getMatchScore(
              candidate
            );

          const finalScore =
            Number(candidateScore);

          return {
            ...candidate,

            _index:
              index,

            _candidateId:
              candidateId,

            _resumeId:
              getResumeId(
                candidate
              ),

            _name:
              getCandidateName(
                candidate
              ),

            _email:
              getCandidateEmail(
                candidate
              ),

            _score:
              Number.isFinite(
                finalScore
              )
                ? finalScore
                : 0,

            _experience:
              getExperienceMatch(
                candidate
              ),

            _matchedSkills:
              getMatchedSkills(
                candidate
              ),

            _missingSkills:
              getMissingSkills(
                candidate
              ),

            _status:
              status,

            _application:
              candidate?.application ||
              null,
          };
        }
      );
    }, [
      candidates,
    ]);

  /* =======================================================
     SORT CANDIDATES
  ======================================================= */

  const sortedCandidates =
    useMemo(() => {
      const list = [
        ...normalizedCandidates,
      ];

      if (
        sortOrder === "low"
      ) {
        list.sort(
          (a, b) =>
            a._score -
            b._score
        );
      } else {
        list.sort(
          (a, b) =>
            b._score -
            a._score
        );
      }

      return list;
    }, [
      normalizedCandidates,
      sortOrder,
    ]);

  /* =======================================================
     STATISTICS
  ======================================================= */

  const averageScore =
    normalizedCandidates.length >
    0
      ? normalizedCandidates.reduce(
          (
            total,
            candidate
          ) =>
            total +
            candidate._score,
          0
        ) /
        normalizedCandidates.length
      : 0;

  const highMatches =
    normalizedCandidates.filter(
      (candidate) =>
        candidate._score >= 70
    ).length;

  const mediumMatches =
    normalizedCandidates.filter(
      (candidate) =>
        candidate._score >= 40 &&
        candidate._score < 70
    ).length;

  const lowMatches =
    normalizedCandidates.filter(
      (candidate) =>
        candidate._score < 40
    ).length;

  /* =======================================================
     JOB CHANGE
  ======================================================= */

  const handleJobChange =
    (event) => {
      const jobId =
        event.target.value;

      setSelectedJobId(
        jobId
      );

      setCandidates([]);

      setError("");
    };

  /* =======================================================
     SCORE CLASS
  ======================================================= */

  const getScoreClass =
    (score) => {
      if (score >= 70) {
        return "high";
      }

      if (score >= 40) {
        return "medium";
      }

      return "low";
    };

  /* =======================================================
     REVIEW APPLICATION
  ======================================================= */

  const reviewCandidate =
    () => {
      navigate(
        "/recruiter/applications"
      );
    };

  /* =======================================================
     JOB INFORMATION
  ======================================================= */

  const selectedJobTitle =
    firstDefined(
      selectedJob?.job_title,
      selectedJob?.title,
      "Selected Job"
    );

  const selectedCompany =
    firstDefined(
      selectedJob?.company_name,
      selectedJob?.company,
      "Company"
    );

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="rim-page">

      <style>
        {`

          * {
            box-sizing: border-box;
          }

          .rim-page {
            min-height: 100vh;
            background: #f7f8fc;
            color: #15213b;
            padding: 42px 30px 70px;
            font-family:
              Arial,
              Helvetica,
              sans-serif;
          }

          .rim-container {
            max-width: 1350px;
            margin: 0 auto;
          }

          .rim-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 25px;
            margin-bottom: 28px;
          }

          .rim-eyebrow {
            color: #6654e8;
            font-weight: 800;
            font-size: 13px;
            letter-spacing: 1.2px;
            margin-bottom: 10px;
          }

          .rim-header h1 {
            margin: 0;
            font-size: 42px;
            line-height: 1.1;
          }

          .rim-header p {
            color: #68708a;
            margin-top: 10px;
            font-size: 16px;
          }

          .rim-actions {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
          }

          .rim-button {
            border: 1px solid #ddd9f8;
            background: white;
            color: #5d4ce7;
            padding: 12px 17px;
            border-radius: 10px;
            font-weight: 700;
            cursor: pointer;
            font-size: 14px;
          }

          .rim-button.primary {
            background: #6654e8;
            color: white;
            border-color: #6654e8;
          }

          .rim-button:hover {
            transform: translateY(-1px);
          }

          .rim-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none;
          }

          .rim-error {
            background: #fff0f0;
            color: #d93025;
            border: 1px solid #ffd1d1;
            padding: 14px 18px;
            border-radius: 12px;
            margin-bottom: 20px;
          }

          .rim-selector {
            background: white;
            border: 1px solid #e8e6f0;
            border-radius: 18px;
            padding: 23px;
            margin-bottom: 22px;
          }

          .rim-selector label {
            display: block;
            font-weight: 800;
            margin-bottom: 9px;
          }

          .rim-selector-row {
            display: flex;
            gap: 12px;
          }

          .rim-select {
            flex: 1;
            padding: 13px;
            border: 1px solid #d9d9e2;
            border-radius: 10px;
            background: white;
            font-size: 15px;
          }

          .rim-stats {
            display: grid;
            grid-template-columns:
              repeat(4, 1fr);
            gap: 17px;
            margin-bottom: 24px;
          }

          .rim-stat {
            background: white;
            border: 1px solid #e8e6f0;
            border-radius: 18px;
            padding: 22px;
          }

          .rim-stat span {
            color: #718096;
            font-size: 13px;
          }

          .rim-stat strong {
            display: block;
            font-size: 30px;
            margin-top: 8px;
          }

          .rim-job {
            background:
              linear-gradient(
                135deg,
                #f0edff,
                #ffffff
              );
            border: 1px solid #ddd7ff;
            border-radius: 18px;
            padding: 22px;
            margin-bottom: 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 20px;
          }

          .rim-job h2 {
            margin: 0 0 8px;
          }

          .rim-job p {
            margin: 0;
            color: #68708a;
          }

          .rim-job-score {
            color: #6654e8;
            font-size: 34px;
            font-weight: 800;
          }

          .rim-section {
            background: white;
            border: 1px solid #e8e6f0;
            border-radius: 18px;
            padding: 28px;
          }

          .rim-section-head {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 15px;
            margin-bottom: 22px;
          }

          .rim-section-head h2 {
            margin: 0;
            font-size: 28px;
          }

          .rim-section-head p {
            margin: 7px 0 0;
            color: #718096;
          }

          .rim-sort {
            padding: 11px 14px;
            border: 1px solid #ddd;
            border-radius: 10px;
            background: white;
          }

          .rim-card {
            border: 1px solid #e5e3ed;
            border-radius: 18px;
            padding: 28px;
            margin-bottom: 18px;
            background: white;
          }

          .rim-card:last-child {
            margin-bottom: 0;
          }

          .rim-card-top {
            display: flex;
            justify-content: space-between;
            gap: 20px;
            align-items: flex-start;
          }

          .rim-person {
            display: flex;
            gap: 17px;
            align-items: center;
          }

          .rim-avatar {
            width: 62px;
            height: 62px;
            border-radius: 18px;
            background: #eeeaff;
            color: #6654e8;
            display: grid;
            place-items: center;
            font-size: 24px;
            font-weight: 800;
            flex-shrink: 0;
          }

          .rim-person h3 {
            margin: 0 0 6px;
            font-size: 22px;
          }

          .rim-email {
            color: #718096;
          }

          .rim-status {
            margin-top: 8px;
            font-size: 13px;
            font-weight: 800;
            color: #6654e8;
          }

          .rim-score {
            text-align: right;
          }

          .rim-score small {
            display: block;
            color: #718096;
            margin-bottom: 4px;
          }

          .rim-score strong {
            font-size: 32px;
          }

          .rim-score .high {
            color: #169563;
          }

          .rim-score .medium {
            color: #6654e8;
          }

          .rim-score .low {
            color: #d9534f;
          }

          .rim-details {
            border-top: 1px solid #eee;
            border-bottom: 1px solid #eee;
            margin: 25px 0;
            padding: 23px 0;
            display: grid;
            grid-template-columns:
              1.2fr 1fr;
            gap: 26px;
          }

          .rim-detail-title {
            color: #718096;
            font-size: 13px;
            font-weight: 800;
            margin-bottom: 9px;
          }

          .rim-progress {
            height: 10px;
            border-radius: 20px;
            background: #ecebf4;
            overflow: hidden;
            margin-top: 10px;
          }

          .rim-progress div {
            height: 100%;
            background: #6654e8;
            border-radius: inherit;
          }

          .rim-skills {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
          }

          .rim-skill {
            display: inline-block;
            background: #eeeaff;
            color: #5d4ce7;
            padding: 7px 10px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 700;
          }

          .rim-skill.missing {
            background: #fff0f0;
            color: #d9534f;
          }

          .rim-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 15px;
          }

          .rim-meta {
            color: #718096;
            font-size: 14px;
          }

          .rim-loading,
          .rim-empty {
            padding: 50px 20px;
            text-align: center;
            color: #718096;
          }

          .rim-empty h3 {
            color: #15213b;
            margin-bottom: 6px;
          }

          @media (max-width: 900px) {

            .rim-stats {
              grid-template-columns:
                repeat(2, 1fr);
            }

            .rim-details {
              grid-template-columns: 1fr;
            }

            .rim-header {
              flex-direction: column;
            }
          }

          @media (max-width: 600px) {

            .rim-page {
              padding:
                25px
                15px
                50px;
            }

            .rim-header h1 {
              font-size: 32px;
            }

            .rim-stats {
              grid-template-columns: 1fr;
            }

            .rim-selector-row {
              flex-direction: column;
            }

            .rim-card-top {
              flex-direction: column;
            }

            .rim-footer {
              flex-direction: column;
              align-items: flex-start;
            }

            .rim-score {
              text-align: left;
            }

            .rim-job {
              align-items: flex-start;
              flex-direction: column;
            }
          }

        `}
      </style>

      <div className="rim-container">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="rim-header">

          <div>

            <div className="rim-eyebrow">
              AI RECRUITMENT INTELLIGENCE
            </div>

            <h1>
              Candidate Matches
            </h1>

            <p>
              Find and review candidates
              ranked by HireIntel AI matching.
            </p>

          </div>

          <div className="rim-actions">

            <button
              type="button"
              className="rim-button"
              onClick={() =>
                navigate(
                  "/recruiter/dashboard"
                )
              }
            >
              ← Dashboard
            </button>

            <button
              type="button"
              className="rim-button primary"
              onClick={() =>
                navigate(
                  "/recruiter/applications"
                )
              }
            >
              Applications →
            </button>

          </div>

        </div>

        {/* =================================================
            ERRORS
        ================================================= */}

        {error && (
          <div className="rim-error">
            {error}
          </div>
        )}

        {/* =================================================
            SELECT JOB
        ================================================= */}

        <div className="rim-selector">

          <label htmlFor="rim-job">
            Select Job
          </label>

          <div className="rim-selector-row">

            <select
              id="rim-job"
              className="rim-select"
              value={selectedJobId}
              onChange={
                handleJobChange
              }
              disabled={loadingJobs}
            >

              <option value="">
                {loadingJobs
                  ? "Loading jobs..."
                  : jobs.length === 0
                  ? "No jobs available"
                  : "Select a job"}
              </option>

              {jobs.map((job) => {

                const id =
                  firstDefined(
                    job?.job_id,
                    job?.id
                  );

                const title =
                  firstDefined(
                    job?.job_title,
                    job?.title,
                    "Job"
                  );

                const company =
                  firstDefined(
                    job?.company_name,
                    job?.company,
                    ""
                  );

                return (
                  <option
                    key={id}
                    value={id}
                  >
                    {title}
                    {company
                      ? ` — ${company}`
                      : ""}
                  </option>
                );
              })}

            </select>

            <button
              type="button"
              className="rim-button primary"
              disabled={
                !selectedJobId
              }
              onClick={() =>
                navigate(
                  `/recruiter/jobs/${selectedJobId}`
                )
              }
            >
              View Job
            </button>

          </div>

        </div>

        {/* =================================================
            STATISTICS
        ================================================= */}

        <div className="rim-stats">

          <div className="rim-stat">

            <span>
              Matched Candidates
            </span>

            <strong>
              {normalizedCandidates.length}
            </strong>

          </div>

          <div className="rim-stat">

            <span>
              High Matches
            </span>

            <strong>
              {highMatches}
            </strong>

          </div>

          <div className="rim-stat">

            <span>
              Medium Matches
            </span>

            <strong>
              {mediumMatches}
            </strong>

          </div>

          <div className="rim-stat">

            <span>
              Low Matches
            </span>

            <strong>
              {lowMatches}
            </strong>

          </div>

        </div>

        {/* =================================================
            SELECTED JOB
        ================================================= */}

        {selectedJob && (
          <div className="rim-job">

            <div>

              <h2>
                {selectedJobTitle}
              </h2>

              <p>
                {selectedCompany}

                {selectedJob?.location
                  ? ` • ${selectedJob.location}`
                  : ""}
              </p>

            </div>

            <div className="rim-job-score">
              {averageScore.toFixed(2)}%
            </div>

          </div>
        )}

        {/* =================================================
            RANKED CANDIDATES
        ================================================= */}

        <div className="rim-section">

          <div className="rim-section-head">

            <div>

              <h2>
                Ranked Candidates
              </h2>

              <p>
                Review skills, experience
                and AI match scores.
              </p>

            </div>

            <select
              className="rim-sort"
              value={sortOrder}
              onChange={(event) =>
                setSortOrder(
                  event.target.value
                )
              }
            >

              <option value="high">
                Highest Match First
              </option>

              <option value="low">
                Lowest Match First
              </option>

            </select>

          </div>

          {/* =================================================
              LOADING
          ================================================= */}

          {loadingCandidates ? (

            <div className="rim-loading">

              Loading AI candidate
              matches...

            </div>

          ) : sortedCandidates.length === 0 ? (

            <div className="rim-empty">

              <div
                style={{
                  fontSize: 42,
                }}
              >
                ✨
              </div>

              <h3>
                No candidate matches found
              </h3>

              <p>
                Select a job with candidate
                matches to see them here.
              </p>

            </div>

          ) : (

            sortedCandidates.map(
              (
                candidate,
                index
              ) => (

                <div
                  className="rim-card"
                  key={
                    candidate._candidateId ??
                    candidate._resumeId ??
                    candidate._index ??
                    index
                  }
                >

                  {/* =========================================
                      CANDIDATE HEADER
                  ========================================= */}

                  <div className="rim-card-top">

                    <div className="rim-person">

                      <div className="rim-avatar">

                        {candidate._name
                          .charAt(0)
                          .toUpperCase()}

                      </div>

                      <div>

                        <h3>
                          {candidate._name}
                        </h3>

                        <div className="rim-email">
                          {candidate._email}
                        </div>

                        <div className="rim-status">
                          Status:{" "}
                          {candidate._status}
                        </div>

                      </div>

                    </div>

                    <div className="rim-score">

                      <small>
                        AI Match Score
                      </small>

                      <strong
                        className={
                          getScoreClass(
                            candidate._score
                          )
                        }
                      >
                        {candidate._score.toFixed(
                          2
                        )}
                        %
                      </strong>

                    </div>

                  </div>

                  {/* =========================================
                      DETAILS
                  ========================================= */}

                  <div className="rim-details">

                    {/* EXPERIENCE */}

                    <div>

                      <div className="rim-detail-title">
                        EXPERIENCE MATCH
                      </div>

                      <strong>
                        {candidate._experience.toFixed(
                          0
                        )}
                        %
                      </strong>

                      <div className="rim-progress">

                        <div
                          style={{
                            width:
                              `${Math.min(
                                100,
                                Math.max(
                                  0,
                                  candidate._experience
                                )
                              )}%`,
                          }}
                        />

                      </div>

                    </div>

                    {/* RESUME INFORMATION */}

                    <div>

                      <div className="rim-detail-title">
                        RESUME INFORMATION
                      </div>

                      <div>
                        Candidate ID:{" "}
                        <strong>
                          {
                            candidate._candidateId ??
                            "N/A"
                          }
                        </strong>
                      </div>

                      <div
                        style={{
                          marginTop: 7,
                        }}
                      >
                        Resume ID:{" "}
                        <strong>
                          {
                            candidate._resumeId ??
                            "N/A"
                          }
                        </strong>
                      </div>

                    </div>

                    {/* MATCHED SKILLS */}

                    <div>

                      <div className="rim-detail-title">
                        MATCHED SKILLS
                      </div>

                      <div className="rim-skills">

                        {candidate
                          ._matchedSkills
                          .length > 0 ? (

                          candidate
                            ._matchedSkills
                            .map(
                              (
                                skill,
                                skillIndex
                              ) => (

                                <span
                                  className="rim-skill"
                                  key={`${skill}-${skillIndex}`}
                                >
                                  {skill}
                                </span>

                              )
                            )

                        ) : (

                          <span
                            style={{
                              color:
                                "#718096",
                            }}
                          >
                            No matched skills
                            available
                          </span>

                        )}

                      </div>

                    </div>

                    {/* MISSING SKILLS */}

                    <div>

                      <div className="rim-detail-title">
                        MISSING SKILLS
                      </div>

                      <div className="rim-skills">

                        {candidate
                          ._missingSkills
                          .length > 0 ? (

                          candidate
                            ._missingSkills
                            .map(
                              (
                                skill,
                                skillIndex
                              ) => (

                                <span
                                  className="rim-skill missing"
                                  key={`${skill}-${skillIndex}`}
                                >
                                  {skill}
                                </span>

                              )
                            )

                        ) : (

                          <span
                            style={{
                              color:
                                "#169563",
                              fontWeight:
                                700,
                            }}
                          >
                            No missing skills
                          </span>

                        )}

                      </div>

                    </div>

                  </div>

                  {/* =========================================
                      FOOTER
                  ========================================= */}

                  <div className="rim-footer">

                    <div className="rim-meta">

                      Candidate #
                      {
                        candidate._candidateId ??
                        "N/A"
                      }

                      {" • "}

                      Resume #
                      {
                        candidate._resumeId ??
                        "N/A"
                      }

                    </div>

                    <button
                      type="button"
                      className="rim-button primary"
                      onClick={() =>
                        reviewCandidate(
                          candidate
                        )
                      }
                    >

                      Review Applications →

                    </button>

                  </div>

                </div>

              )
            )

          )}

        </div>

      </div>

    </div>
  );
}

export default RecruiterCandidateMatches;