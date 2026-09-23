import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./FindJobs.css";

const API_URL = "http://127.0.0.1:8000";

/* =========================================================
   GET JOBS FROM BACKEND
========================================================= */

async function getJobsFromAPI(
  token,
  filters = {},
  pageNumber = 1
) {
  const params = new URLSearchParams();

  if (filters.search?.trim()) {
    params.append(
      "search",
      filters.search.trim()
    );
  }

  if (filters.location?.trim()) {
    params.append(
      "location",
      filters.location.trim()
    );
  }

  if (filters.jobType?.trim()) {
    params.append(
      "job_type",
      filters.jobType.trim()
    );
  }

  if (filters.skills?.trim()) {
    params.append(
      "skills",
      filters.skills.trim()
    );
  }

  if (filters.experience?.trim()) {
    params.append(
      "experience",
      filters.experience.trim()
    );
  }

  params.append(
    "page",
    String(pageNumber)
  );

  params.append(
    "limit",
    "10"
  );

  const response = await fetch(
    `${API_URL}/candidate/jobs?${params.toString()}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    }
  );

  const data =
    await response
      .json()
      .catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data?.detail ||
        `Unable to load jobs. Status: ${response.status}`
    );
  }

  return data;
}


/* =========================================================
   FIND JOBS COMPONENT
========================================================= */

function FindJobs() {
  const navigate = useNavigate();

  /* =======================================================
     STATE
  ======================================================= */

  const [jobs, setJobs] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [location, setLocation] =
    useState("");

  const [jobType, setJobType] =
    useState("");

  const [skills, setSkills] =
    useState("");

  const [experience, setExperience] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [totalJobs, setTotalJobs] =
    useState(0);

  const [totalPages, setTotalPages] =
    useState(0);

  const token =
    localStorage.getItem(
      "hireintel_token"
    );


  /* =======================================================
     LOGIN CHECK
  ======================================================= */

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [navigate, token]);


  /* =======================================================
     INITIAL JOB LOAD
  ======================================================= */

  useEffect(() => {
    if (!token) {
      return;
    }

    let cancelled = false;

    const loadInitialJobs = async () => {
      try {
        const data =
          await getJobsFromAPI(
            token,
            {
              search: "",
              location: "",
              jobType: "",
              skills: "",
              experience: "",
            },
            1
          );

        if (cancelled) {
          return;
        }

        setJobs(
          Array.isArray(data.jobs)
            ? data.jobs
            : []
        );

        setTotalJobs(
          data.total_jobs || 0
        );

        setTotalPages(
          data.total_pages || 0
        );

        setPage(
          data.page || 1
        );

      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error(
          "Initial jobs error:",
          err
        );

        const errorMessage =
          err?.message ||
          "Unable to load available jobs.";

        if (
          errorMessage
            .toLowerCase()
            .includes("401")
        ) {
          localStorage.removeItem(
            "hireintel_token"
          );

          navigate("/login");

          return;
        }

        setError(
          errorMessage
        );

        setJobs([]);

        setTotalJobs(0);

        setTotalPages(0);

      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    const timer =
      setTimeout(
        loadInitialJobs,
        0
      );

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };

  }, [navigate, token]);


  /* =======================================================
     LOAD JOBS WITH CURRENT FILTERS
  ======================================================= */

  const loadJobs = async (
    pageNumber = 1
  ) => {
    const currentToken =
      localStorage.getItem(
        "hireintel_token"
      );

    if (!currentToken) {
      navigate("/login");
      return;
    }

    setLoading(true);

    setError("");

    try {
      const data =
        await getJobsFromAPI(
          currentToken,
          {
            search,
            location,
            jobType,
            skills,
            experience,
          },
          pageNumber
        );

      setJobs(
        Array.isArray(data.jobs)
          ? data.jobs
          : []
      );

      setTotalJobs(
        data.total_jobs || 0
      );

      setTotalPages(
        data.total_pages || 0
      );

      setPage(
        data.page || pageNumber
      );

    } catch (err) {
      console.error(
        "Load jobs error:",
        err
      );

      const errorMessage =
        err?.message ||
        "Unable to load available jobs.";

      if (
        errorMessage
          .toLowerCase()
          .includes("401")
      ) {
        localStorage.removeItem(
          "hireintel_token"
        );

        navigate("/login");

        return;
      }

      setError(
        errorMessage
      );

      setJobs([]);

      setTotalJobs(0);

      setTotalPages(0);

    } finally {
      setLoading(false);
    }
  };


  /* =======================================================
     SEARCH
  ======================================================= */

  const handleSearch = (
    event
  ) => {
    event.preventDefault();

    loadJobs(1);
  };


  /* =======================================================
     CLEAR FILTERS
  ======================================================= */

  const handleClearFilters = () => {
    setSearch("");
    setLocation("");
    setJobType("");
    setSkills("");
    setExperience("");

    const currentToken =
      localStorage.getItem(
        "hireintel_token"
      );

    if (!currentToken) {
      navigate("/login");
      return;
    }

    setLoading(true);
    setError("");

    getJobsFromAPI(
      currentToken,
      {
        search: "",
        location: "",
        jobType: "",
        skills: "",
        experience: "",
      },
      1
    )
      .then((data) => {
        setJobs(
          Array.isArray(data.jobs)
            ? data.jobs
            : []
        );

        setTotalJobs(
          data.total_jobs || 0
        );

        setTotalPages(
          data.total_pages || 0
        );

        setPage(
          data.page || 1
        );
      })
      .catch((err) => {
        console.error(
          "Clear filters error:",
          err
        );

        setError(
          err?.message ||
            "Unable to load jobs."
        );

        setJobs([]);

        setTotalJobs(0);

        setTotalPages(0);
      })
      .finally(() => {
        setLoading(false);
      });
  };


  /* =======================================================
     PAGINATION
  ======================================================= */

  const handlePageChange = (
    pageNumber
  ) => {
    if (
      pageNumber < 1 ||
      pageNumber > totalPages ||
      pageNumber === page
    ) {
      return;
    }

    loadJobs(pageNumber);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };


  /* =======================================================
     VIEW JOB DETAILS
  ======================================================= */

  const handleViewDetails = (
    jobId
  ) => {
    if (!jobId) {
      setError(
        "Job ID is missing."
      );
      return;
    }

    navigate(
      `/candidate/jobs/${jobId}`
    );
  };


  /* =======================================================
     APPLY FOR JOB
  ======================================================= */

  const handleApply = (
    jobId
  ) => {
    if (!jobId) {
      setError(
        "Job ID is missing."
      );
      return;
    }

    navigate(
      `/candidate/jobs/${jobId}/apply`
    );
  };


  /* =======================================================
     FORMAT DATE
  ======================================================= */

  const formatDate = (
    dateValue
  ) => {
    if (!dateValue) {
      return "Recently";
    }

    const date =
      new Date(dateValue);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "Recently";
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };


  /* =======================================================
     GET SKILLS
  ======================================================= */

  const getSkills = (
    skillsText
  ) => {
    if (!skillsText) {
      return [];
    }

    return skillsText
      .split(",")
      .map(
        (skill) =>
          skill.trim()
      )
      .filter(Boolean);
  };


  /* =======================================================
     LOADING
  ======================================================= */

  if (
    loading &&
    jobs.length === 0
  ) {
    return (
      <div className="find-jobs-page">

        <div className="jobs-loading">

          <div className="jobs-spinner"></div>

          <h2>
            Finding opportunities...
          </h2>

          <p>
            Please wait while we
            load available jobs.
          </p>

        </div>

      </div>
    );
  }


  /* =======================================================
     MAIN PAGE
  ======================================================= */

  return (
    <div className="find-jobs-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="find-jobs-header">

        <div className="find-jobs-header-top">

          <div>

            <p className="page-eyebrow">
              CAREER OPPORTUNITIES
            </p>

            <h1>
              Find Jobs
            </h1>

            <p>
              Discover opportunities that
              match your skills, experience,
              and career goals.
            </p>

          </div>


          <button
            type="button"
            className="find-jobs-back"
            onClick={() =>
              navigate(
                "/candidate/dashboard"
              )
            }
          >
            ← Dashboard
          </button>

        </div>

      </header>


      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="jobs-error">
          {error}
        </div>
      )}


      {/* =================================================
          SEARCH / FILTERS
      ================================================= */}

      <section className="find-jobs-search-card">

        <form
          onSubmit={handleSearch}
        >

          <div className="search-main-row">

            <div className="search-input-wrapper">

              <input
                type="text"
                className="search-input"
                placeholder="Search job title, company, skills..."
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
              />

            </div>


            <button
              type="submit"
              className="search-button"
              disabled={loading}
            >
              {loading
                ? "Searching..."
                : "Search Jobs"}
            </button>

          </div>


          <div className="jobs-filter-row">

            <input
              type="text"
              className="jobs-filter-input"
              placeholder="Location"
              value={location}
              onChange={(event) =>
                setLocation(
                  event.target.value
                )
              }
            />


            <select
              className="jobs-filter-select"
              value={jobType}
              onChange={(event) =>
                setJobType(
                  event.target.value
                )
              }
            >

              <option value="">
                All Job Types
              </option>

              <option value="Full Time">
                Full Time
              </option>

              <option value="Part Time">
                Part Time
              </option>

              <option value="Internship">
                Internship
              </option>

              <option value="Contract">
                Contract
              </option>

            </select>


            <input
              type="text"
              className="jobs-filter-input"
              placeholder="Skills: Python, FastAPI"
              value={skills}
              onChange={(event) =>
                setSkills(
                  event.target.value
                )
              }
            />


            <select
              className="jobs-filter-select"
              value={experience}
              onChange={(event) =>
                setExperience(
                  event.target.value
                )
              }
            >

              <option value="">
                All Experience
              </option>

              <option value="0-1">
                0-1 years
              </option>

              <option value="0-2">
                0-2 years
              </option>

              <option value="1-3">
                1-3 years
              </option>

              <option value="2-5">
                2-5 years
              </option>

            </select>


            <button
              type="button"
              className="clear-filters-button"
              onClick={
                handleClearFilters
              }
            >
              Clear Filters
            </button>

          </div>

        </form>

      </section>


      {/* =================================================
          RESULTS
      ================================================= */}

      <main className="jobs-results-container">

        <div className="jobs-results-header">

          <div>

            <h2>
              Available Jobs
            </h2>

            <p>
              Explore opportunities
              matched to your career.
            </p>

          </div>


          <span className="jobs-results-count">

            {totalJobs}{" "}

            {totalJobs === 1
              ? "job"
              : "jobs"}{" "}
            found

          </span>

        </div>


        {/* =================================================
            JOB LIST
        ================================================= */}

        {jobs.length > 0 ? (

          <div className="jobs-list">

            {jobs.map(
              (job) => {

                const jobSkills =
                  getSkills(
                    job.required_skills
                  );

                return (

                  <article
                    className="job-card"
                    key={job.id}
                  >

                    {/* AI BADGE */}

                    <div className="ai-match-badge">
                      ✨ AI-Powered Matching
                    </div>


                    {/* JOB TITLE */}

                    <div className="job-card-header">

                      <div className="job-title-section">

                        <h3>
                          {job.job_title}
                        </h3>

                        <div className="job-company">
                          {job.company_name ||
                            "Company not specified"}
                        </div>

                      </div>

                    </div>


                    {/* JOB INFORMATION */}

                    <div className="job-meta">

                      <span className="job-meta-item">
                        📍{" "}
                        {job.location ||
                          "Location not specified"}
                      </span>

                      <span className="job-meta-item">
                        💼{" "}
                        {job.job_type ||
                          "Full Time"}
                      </span>

                      <span className="job-meta-item">
                        📅{" "}
                        {formatDate(
                          job.created_at
                        )}
                      </span>

                    </div>


                    {/* DESCRIPTION */}

                    <p className="job-description">
                      {job.description}
                    </p>


                    {/* EXPERIENCE */}

                    {job.experience_required && (

                      <div className="job-experience">

                        <strong>
                          Experience:
                        </strong>{" "}

                        {
                          job.experience_required
                        }

                      </div>

                    )}


                    {/* REQUIRED SKILLS */}

                    {jobSkills.length > 0 && (

                      <div className="job-skills-section">

                        <span className="job-skills-title">
                          Required Skills
                        </span>

                        <div className="job-skills">

                          {jobSkills.map(
                            (
                              skill,
                              index
                            ) => (

                              <span
                                className="job-skill"
                                key={`${job.id}-${index}`}
                              >
                                {skill}
                              </span>

                            )
                          )}

                        </div>

                      </div>

                    )}


                    {/* ACTION BUTTONS */}

                    <div className="job-actions">

                      <button
                        type="button"
                        className="view-job-button"
                        onClick={() =>
                          handleViewDetails(
                            job.id
                          )
                        }
                      >
                        View Details
                      </button>


                      <button
                        type="button"
                        className="apply-job-button"
                        onClick={() =>
                          handleApply(
                            job.id
                          )
                        }
                      >
                        Apply Now →
                      </button>

                    </div>

                  </article>

                );
              }
            )}

          </div>

        ) : (

          <div className="jobs-empty-state">

            <div className="jobs-empty-icon">
              🔍
            </div>

            <h3>
              No jobs found
            </h3>

            <p>
              Try changing your search
              or filters.
            </p>

            <button
              type="button"
              className="apply-job-button"
              onClick={
                handleClearFilters
              }
            >
              Clear Filters
            </button>

          </div>

        )}


        {/* =================================================
            PAGINATION
        ================================================= */}

        {totalPages > 1 && (

          <div className="jobs-pagination">

            <button
              type="button"
              className="pagination-button"
              disabled={page === 1}
              onClick={() =>
                handlePageChange(
                  page - 1
                )
              }
            >
              ←
            </button>


            {Array.from(
              {
                length: totalPages,
              },
              (_, index) =>
                index + 1
            ).map(
              (pageNumber) => (

                <button
                  type="button"
                  key={pageNumber}
                  className={`pagination-button ${
                    pageNumber === page
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    handlePageChange(
                      pageNumber
                    )
                  }
                >
                  {pageNumber}
                </button>

              )
            )}


            <button
              type="button"
              className="pagination-button"
              disabled={
                page === totalPages
              }
              onClick={() =>
                handlePageChange(
                  page + 1
                )
              }
            >
              →
            </button>

          </div>

        )}

      </main>

    </div>
  );
}

export default FindJobs;