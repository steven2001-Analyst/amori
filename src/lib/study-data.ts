export interface Topic {
  id: string;
  title: string;
  description: string;
}

export interface Subject {
  id: string;
  title: string;
  icon: string;
  color: string;
  gradient: string;
  topics: Topic[];
}

export const subjects: Subject[] = [
  {
    id: "intro-data-analytics",
    title: "Introduction to Data Analytics",
    icon: "BarChart3",
    color: "emerald",
    gradient: "from-emerald-500 to-teal-600",
    topics: [
      {
        id: "intro-1",
        title: "What is Data Analytics & Why It Matters",
        description: "Understand the fundamentals of data analytics, its importance in decision-making, and how organizations leverage data to gain competitive advantages.",
      },
      {
        id: "intro-2",
        title: "Types of Data Analytics: Descriptive, Diagnostic, Predictive, Prescriptive",
        description: "Explore the four main types of data analytics and understand when to apply each approach for maximum business impact.",
      },
      {
        id: "intro-3",
        title: "The Data Analytics Lifecycle: From Collection to Insight",
        description: "Learn the complete data analytics lifecycle from data collection and cleaning to analysis, visualization, and sharing insights.",
      },
      {
        id: "intro-4",
        title: "The Role of a Data Analyst in Modern Business",
        description: "Discover what data analysts do daily, the skills required, and how they bridge the gap between technical teams and business stakeholders.",
      },
      {
        id: "intro-5",
        title: "Essential Tools & Technologies Overview",
        description: "Get a comprehensive overview of the tools used in data analytics including Excel, SQL, Python, Power BI, and more.",
      },
      {
        id: "intro-6",
        title: "Data Ethics, Privacy & Compliance Fundamentals",
        description: "Understand ethical considerations in data handling, privacy regulations like GDPR, and best practices for responsible data use.",
      },
    ],
  },
  {
    id: "microsoft-excel",
    title: "Microsoft Excel",
    icon: "Table2",
    color: "green",
    gradient: "from-green-500 to-emerald-600",
    topics: [
      {
        id: "excel-1",
        title: "Excel Interface, Navigation & Keyboard Shortcuts Mastery",
        description: "Master the Excel interface, ribbon navigation, workbook management, and essential keyboard shortcuts for maximum productivity.",
      },
      {
        id: "excel-2",
        title: "Formulas, Functions & Cell References (Relative & Absolute)",
        description: "Learn to write powerful formulas using relative and absolute cell references, nested functions, and error handling techniques.",
      },
      {
        id: "excel-3",
        title: "Data Formatting, Validation & Protection",
        description: "Apply professional formatting, create data validation rules, and protect worksheets and workbooks from unintended changes.",
      },
      {
        id: "excel-4",
        title: "Pivot Tables, Pivot Charts & Dynamic Dashboards",
        description: "Create interactive pivot tables, pivot charts, and build dynamic dashboards that summarize large datasets effectively.",
      },
      {
        id: "excel-5",
        title: "VLOOKUP, XLOOKUP, INDEX-MATCH & Reference Functions",
        description: "Master lookup and reference functions to search, retrieve, and cross-reference data across multiple sheets and workbooks.",
      },
      {
        id: "excel-6",
        title: "Conditional Formatting, Data Bars & Custom Rules",
        description: "Apply conditional formatting with data bars, color scales, icon sets, and create custom rules for visual data analysis.",
      },
      {
        id: "excel-7",
        title: "Data Analysis ToolPak & What-If Analysis",
        description: "Use the Analysis ToolPak for statistical analysis, scenario manager, goal seek, and data tables for what-if modeling.",
      },
      {
        id: "excel-8",
        title: "Macros & VBA Automation Basics",
        description: "Record macros, understand VBA basics, and automate repetitive tasks to save time and reduce errors in Excel workflows.",
      },
    ],
  },
  {
    id: "sql",
    title: "SQL (Structured Query Language)",
    icon: "Database",
    color: "cyan",
    gradient: "from-cyan-500 to-blue-600",
    topics: [
      {
        id: "sql-1",
        title: "Introduction to Relational Databases & DBMS Concepts",
        description: "Understand relational database concepts, database management systems, tables, keys, and the fundamentals of data storage.",
      },
      {
        id: "sql-2",
        title: "Basic SELECT Queries, WHERE Clauses & Filtering",
        description: "Write SELECT statements, filter data with WHERE clauses, use comparison operators, and sort results with ORDER BY.",
      },
      {
        id: "sql-3",
        title: "Aggregate Functions, GROUP BY & HAVING",
        description: "Use aggregate functions like COUNT, SUM, AVG, MIN, MAX with GROUP BY and HAVING clauses for data summarization.",
      },
      {
        id: "sql-4",
        title: "JOINs: INNER, LEFT, RIGHT, FULL OUTER & CROSS",
        description: "Master different types of JOINs to combine data from multiple tables and understand when to use each join type.",
      },
      {
        id: "sql-5",
        title: "Subqueries, Common Table Expressions (CTEs) & Nested Queries",
        description: "Write subqueries and CTEs for complex data retrieval, improve query readability, and handle multi-step analysis.",
      },
      {
        id: "sql-6",
        title: "Window Functions, RANKING & Analytical Queries",
        description: "Use window functions like ROW_NUMBER, RANK, LAG, LEAD, and running totals for advanced analytical queries.",
      },
      {
        id: "sql-7",
        title: "Database Design, Normalization & ER Diagrams",
        description: "Design efficient database schemas using normalization rules, create entity-relationship diagrams, and understand database modeling.",
      },
      {
        id: "sql-8",
        title: "Stored Procedures, Views & Query Performance Tuning",
        description: "Create stored procedures and views, write optimized queries, understand execution plans, and apply performance tuning techniques.",
      },
    ],
  },
  {
    id: "power-bi",
    title: "Power BI",
    icon: "PieChart",
    color: "yellow",
    gradient: "from-yellow-500 to-orange-500",
    topics: [
      {
        id: "pbi-1",
        title: "Introduction to Power BI Desktop & Service Interface",
        description: "Get started with Power BI Desktop and the Power BI Service, understand the interface, and navigate between views.",
      },
      {
        id: "pbi-2",
        title: "Data Connection, Import & Data Source Management",
        description: "Connect to various data sources including Excel, SQL Server, web APIs, and manage data connections and credentials.",
      },
      {
        id: "pbi-3",
        title: "Power Query Editor & Data Transformation (M Language)",
        description: "Use Power Query Editor for data transformation, understand M Language basics, and build robust data preparation steps.",
      },
      {
        id: "pbi-4",
        title: "DAX Fundamentals: Calculated Columns, Measures & Time Intelligence",
        description: "Learn DAX for creating calculated columns and measures, and master time intelligence functions for period-over-period analysis.",
      },
      {
        id: "pbi-5",
        title: "Data Modeling: Relationships, Star Schema & SCD",
        description: "Build effective data models with proper relationships, implement star schema design, and handle slowly changing dimensions.",
      },
      {
        id: "pbi-6",
        title: "Visualizations: Charts, Maps, Cards & Custom Visuals",
        description: "Create compelling visualizations including bar charts, line charts, maps, KPI cards, and explore custom visual marketplace.",
      },
      {
        id: "pbi-7",
        title: "Interactive Dashboards, Bookmarks & Drill-Through",
        description: "Build interactive dashboards with bookmarks, buttons, drill-through pages, and tooltips for enhanced user experience.",
      },
      {
        id: "pbi-8",
        title: "Power BI Service: Workspaces, Sharing & Row-Level Security",
        description: "Manage Power BI Service workspaces, share reports and dashboards, implement row-level security, and set up data refresh.",
      },
    ],
  },
  {
    id: "python-data-analytics",
    title: "Python for Data Analytics",
    icon: "Code",
    color: "amber",
    gradient: "from-amber-500 to-orange-600",
    topics: [
      {
        id: "py-1",
        title: "Python Fundamentals & Jupyter Notebook Mastery",
        description: "Learn Python basics including variables, data types, loops, functions, and master Jupyter Notebook for interactive analysis.",
      },
      {
        id: "py-2",
        title: "NumPy: Array Operations & Numerical Computing",
        description: "Use NumPy for efficient array operations, mathematical computations, broadcasting, and working with multi-dimensional data.",
      },
      {
        id: "py-3",
        title: "Pandas: DataFrames, Series & Data Manipulation",
        description: "Master Pandas DataFrames and Series for data loading, filtering, grouping, merging, and transformation operations.",
      },
      {
        id: "py-4",
        title: "Data Cleaning, Missing Values & Preprocessing Techniques",
        description: "Handle missing data, remove duplicates, transform data types, encode categorical variables, and apply preprocessing pipelines.",
      },
      {
        id: "py-5",
        title: "Data Visualization: Matplotlib, Seaborn & Plotly",
        description: "Create publication-quality visualizations using Matplotlib, Seaborn for statistical plots, and Plotly for interactive charts.",
      },
      {
        id: "py-6",
        title: "Statistical Analysis, Distributions & Hypothesis Testing",
        description: "Apply statistical methods, understand probability distributions, and perform hypothesis testing with scipy and statsmodels.",
      },
      {
        id: "py-7",
        title: "Introduction to Machine Learning with Scikit-learn",
        description: "Get started with machine learning using Scikit-learn: regression, classification, clustering, and model evaluation techniques.",
      },
      {
        id: "py-8",
        title: "Web Scraping (BeautifulSoup) & API Integration (Requests)",
        description: "Scrape web data using BeautifulSoup, parse HTML content, and integrate with REST APIs using the Requests library.",
      },
    ],
  },
  {
    id: "data-warehousing",
    title: "Data Warehousing",
    icon: "Warehouse",
    color: "teal",
    gradient: "from-teal-500 to-cyan-600",
    topics: [
      {
        id: "dw-1",
        title: "Data Warehouse Fundamentals & Architecture Patterns",
        description: "Understand data warehouse concepts, architecture patterns (top-down, bottom-up), and compare with operational databases.",
      },
      {
        id: "dw-2",
        title: "ETL vs ELT: Processes, Pipelines & Tools",
        description: "Learn ETL and ELT processes, understand pipeline architecture, and explore tools like SSIS, Informatica, and cloud-native options.",
      },
      {
        id: "dw-3",
        title: "Star Schema, Snowflake Schema & Galaxy Schema",
        description: "Design dimensional models using star schema, snowflake schema, and galaxy schema patterns for optimal query performance.",
      },
      {
        id: "dw-4",
        title: "Dimensional Modeling: Facts, Dimensions & Granularity",
        description: "Create fact and dimension tables, understand granularity levels, and apply dimensional modeling best practices.",
      },
      {
        id: "dw-5",
        title: "Data Marts, ODS & Enterprise Data Warehouses",
        description: "Differentiate between data marts, operational data stores, and enterprise data warehouses, and understand when to use each.",
      },
      {
        id: "dw-6",
        title: "Slowly Changing Dimensions (SCD Type 1, 2, 3)",
        description: "Implement slowly changing dimension techniques to track historical changes in dimensional data over time.",
      },
      {
        id: "dw-7",
        title: "Cloud Data Warehousing: Snowflake, BigQuery & Redshift",
        description: "Explore modern cloud data warehouses including Snowflake, Google BigQuery, and Amazon Redshift architecture and features.",
      },
    ],
  },
  {
    id: "databricks-spark",
    title: "Databricks & Apache Spark",
    icon: "Zap",
    color: "orange",
    gradient: "from-orange-500 to-red-500",
    topics: [
      {
        id: "dbx-1",
        title: "Introduction to Databricks Platform & Lakehouse Architecture",
        description: "Get started with Databricks, understand the Lakehouse architecture, and explore the unified data platform capabilities.",
      },
      {
        id: "dbx-2",
        title: "Apache Spark Fundamentals: RDDs, DataFrames & Spark SQL",
        description: "Learn Spark fundamentals including RDDs, DataFrames, Datasets, and use Spark SQL for distributed data processing.",
      },
      {
        id: "dbx-3",
        title: "Databricks Notebooks, Jobs & Workflows",
        description: "Create and manage Databricks notebooks, schedule jobs, and build multi-step workflows for data processing pipelines.",
      },
      {
        id: "dbx-4",
        title: "Delta Lake: ACID Transactions, Time Travel & Optimizations",
        description: "Work with Delta Lake for ACID transactions, time travel queries, schema evolution, and query performance optimizations.",
      },
      {
        id: "dbx-5",
        title: "Spark SQL, UDFs & Performance Optimization",
        description: "Write optimized Spark SQL queries, create user-defined functions, and apply performance tuning techniques.",
      },
      {
        id: "dbx-6",
        title: "MLflow: Experiment Tracking, Models & Registry",
        description: "Use MLflow for experiment tracking, model management, model registry, and reproducible machine learning workflows.",
      },
      {
        id: "dbx-7",
        title: "Databricks SQL Analytics, Dashboards & Serverless Computing",
        description: "Create SQL endpoints, build dashboards, and leverage serverless computing for scalable data analytics.",
      },
    ],
  },
  {
    id: "advanced-modern-topics",
    title: "Advanced Modern Topics",
    icon: "Rocket",
    color: "rose",
    gradient: "from-rose-500 to-pink-600",
    topics: [
      {
        id: "adv-1",
        title: "Cloud Computing for Data: AWS, Azure & GCP Services",
        description: "Explore cloud data services across AWS, Azure, and GCP including storage, compute, and managed analytics services.",
      },
      {
        id: "adv-2",
        title: "Data Governance, Quality Frameworks & Master Data Management",
        description: "Implement data governance frameworks, data quality monitoring, and master data management for organizational data integrity.",
      },
      {
        id: "adv-3",
        title: "A/B Testing, Experimentation & Causal Inference",
        description: "Design and analyze A/B tests, understand experimentation frameworks, and apply causal inference techniques for data-driven decisions.",
      },
      {
        id: "adv-4",
        title: "Real-Time Analytics: Kafka, Spark Streaming & Flink",
        description: "Build real-time data pipelines using Apache Kafka, Spark Streaming, and Apache Flink for streaming analytics.",
      },
      {
        id: "adv-5",
        title: "Version Control (Git), CI/CD & DataOps Fundamentals",
        description: "Use Git for version control, set up CI/CD pipelines, and understand DataOps principles for data team collaboration.",
      },
      {
        id: "adv-6",
        title: "Data Storytelling, Visualization Best Practices & Communication",
        description: "Master data storytelling techniques, visualization best practices, and effective communication of analytical findings.",
      },
      {
        id: "adv-7",
        title: "AI & Generative AI for Analytics: ChatGPT, Copilot & AutoML",
        description: "Leverage generative AI tools like ChatGPT and Microsoft Copilot for analytics, and explore AutoML for automated modeling.",
      },
      {
        id: "adv-8",
        title: "Data Engineering Fundamentals: Airflow, dbt & Orchestration",
        description: "Understand data engineering concepts, use Apache Airflow for orchestration, and apply dbt for data transformation.",
      },
    ],
  },
  {
    id: "data-science-fundamentals",
    title: "Data Science Fundamentals",
    icon: "FlaskConical",
    color: "violet",
    gradient: "from-violet-500 to-purple-600",
    topics: [
      {
        id: "ds-1",
        title: "Statistics & Probability",
        description: "Master descriptive and inferential statistics, probability distributions, expected value, variance, and the law of large numbers for data-driven decision making.",
      },
      {
        id: "ds-2",
        title: "Hypothesis Testing",
        description: "Learn null and alternative hypotheses, p-values, significance levels, t-tests, chi-square tests, and how to draw valid conclusions from experiments.",
      },
      {
        id: "ds-3",
        title: "Regression Analysis",
        description: "Understand linear and multiple regression, coefficient interpretation, R-squared, residual analysis, and regularization techniques like Lasso and Ridge.",
      },
      {
        id: "ds-4",
        title: "Classification Algorithms",
        description: "Explore logistic regression, decision trees, random forests, SVMs, and k-NN for building classification models that predict categorical outcomes.",
      },
      {
        id: "ds-5",
        title: "Clustering & Segmentation",
        description: "Learn k-Means, hierarchical clustering, DBSCAN, and dimensionality reduction with PCA for discovering natural groupings in data.",
      },
      {
        id: "ds-6",
        title: "Feature Engineering",
        description: "Master techniques for creating, selecting, and transforming features including encoding, scaling, polynomial features, and automated feature selection methods.",
      },
      {
        id: "ds-7",
        title: "Model Evaluation & Validation",
        description: "Apply cross-validation, confusion matrices, ROC/AUC curves, precision-recall tradeoffs, and bootstrapping for robust model assessment.",
      },
      {
        id: "ds-8",
        title: "A/B Testing",
        description: "Design and analyze A/B tests with proper sample sizing, statistical power, sequential testing, and multi-armed bandit approaches for data-driven product decisions.",
      },
    ],
  },
  {
    id: "data-engineering",
    title: "Data Engineering",
    icon: "Server",
    color: "slate",
    gradient: "from-slate-500 to-zinc-600",
    topics: [
      {
        id: "de-1",
        title: "Data Pipeline Fundamentals",
        description: "Understand data pipeline architecture, batch vs. streaming, data ingestion patterns, and the end-to-end flow from source to consumption.",
      },
      {
        id: "de-2",
        title: "ETL Processes & Tools",
        description: "Master Extract, Transform, Load workflows using tools like Airbyte, Fivetran, and custom scripts for reliable data movement and transformation.",
      },
      {
        id: "de-3",
        title: "Data Modeling & Schema Design",
        description: "Design effective schemas using star and snowflake patterns, handle slowly changing dimensions, and create models optimized for analytical queries.",
      },
      {
        id: "de-4",
        title: "Apache Spark Fundamentals",
        description: "Learn distributed computing with Spark, including RDDs, DataFrames, Spark SQL, and performance optimization for large-scale data processing.",
      },
      {
        id: "de-5",
        title: "Cloud Data Platforms (AWS/GCP/Azure)",
        description: "Explore managed data services across major clouds: AWS (S3, Glue, Redshift), GCP (BigQuery, Dataflow), and Azure (Synapse, Data Factory).",
      },
      {
        id: "de-6",
        title: "Data Lake Architecture",
        description: "Build and manage data lakes with zone-based architecture (raw, curated, refined), metadata management, and governance frameworks.",
      },
      {
        id: "de-7",
        title: "Orchestration (Airflow, Prefect)",
        description: "Schedule and monitor data workflows using Apache Airflow DAGs, Prefect tasks, and best practices for pipeline reliability and error handling.",
      },
      {
        id: "de-8",
        title: "Data Quality & Monitoring",
        description: "Implement data quality checks with Great Expectations, set up data observability, create data contracts, and build alerting systems for pipeline health.",
      },
    ],
  },
  {
    id: "machine-learning",
    title: "Machine Learning",
    icon: "Brain",
    color: "fuchsia",
    gradient: "from-fuchsia-500 to-pink-600",
    topics: [
      {
        id: "ml-1",
        title: "Supervised Learning Basics",
        description: "Learn the foundations of supervised learning including train/test splits, bias-variance tradeoff, cross-validation, and core algorithms for regression and classification.",
      },
      {
        id: "ml-2",
        title: "Unsupervised Learning",
        description: "Explore dimensionality reduction (PCA, t-SNE, UMAP), clustering algorithms (k-Means, DBSCAN, Gaussian Mixtures), and anomaly detection techniques.",
      },
      {
        id: "ml-3",
        title: "Neural Networks Intro",
        description: "Understand perceptrons, backpropagation, activation functions, loss landscapes, and build your first neural networks with TensorFlow or PyTorch.",
      },
      {
        id: "ml-4",
        title: "Natural Language Processing",
        description: "Master text preprocessing, word embeddings, sentiment analysis, named entity recognition, and transformer architectures like BERT and GPT.",
      },
      {
        id: "ml-5",
        title: "Computer Vision Basics",
        description: "Learn image processing fundamentals, convolutional neural networks (CNNs), transfer learning, object detection, and image classification pipelines.",
      },
      {
        id: "ml-6",
        title: "MLOps & Model Deployment",
        description: "Deploy ML models to production using containerization, model serving, CI/CD for ML, monitoring drift, and managing the full model lifecycle.",
      },
    ],
  },
];

export const getAllTopics = (): Topic[] => {
  return subjects.flatMap((s) => s.topics);
};

export const getTotalTopicCount = (): number => {
  return getAllTopics().length;
};
