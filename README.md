🌆 Maintenance Tracker 🛠️

Maintenance Tracker is a web application designed to help citizens report city infrastructure issues and allow municipalities to manage and track these issues effectively. This project features an intuitive UI for users to report issues, an admin dashboard to manage reports, and Cloudinary integration for uploading images.

📌 Features

Citizen Reporting:

Users can report various infrastructure issues such as streetlight outages, road damage, water pipe leaks, and more.

Ability to upload images with issue reports using Cloudinary.

Admin Dashboard:

Admins can view all reported issues, mark them as resolved, and update their status.

Responsive Design:

The app is fully responsive, ensuring optimal user experience across mobile, tablet, and desktop devices.

Real-Time Notifications:

Provides real-time notifications on the success or failure of actions using React Toastify.

🔧 Technologies Used

Frontend:

React: Building the user interface with reusable components.

Next.js: Server-side rendering for faster page loads and better SEO.

Tailwind CSS: Utility-first CSS framework to create a responsive and visually appealing design.

React Hook Form: Efficient form handling and validation.

Backend:

Node.js & Express: Backend server handling API requests and managing data.

MongoDB: Database for storing user data, issues, and images.

Image Handling:

Cloudinary: Cloud-based image storage for uploading and serving issue images.

Authentication:

JWT (JSON Web Tokens): Securing user sessions and managing authentication for admin users.

🚀 Setup and Usage
1. Clone the repository
git clone https://github.com/Shatha-AbuShammala/maintenance-tracker.git

2. Install dependencies

Navigate to the project directory and install dependencies:

cd maintenance-tracker
npm install

3. Set up Environment Variables

Create a .env.local file in the root directory and add the following environment variables:

CLOUDINARY_URL=cloudinary://<your_api_key>:<your_api_secret>@<your_cloud_name>


Make sure to replace <your_api_key>, <your_api_secret>, and <your_cloud_name> with your actual Cloudinary credentials.

4. Run the application

To start the application in development mode:

npm run dev


Visit http://localhost:3000
 in your browser.

🔑 Admin Credentials

For testing the Admin Dashboard, use the following credentials:

Email: admin1@gmail.com

Password: 1234567

🛠️ Features to Explore:

Citizen's Issue Reporting

Fill out a form to report issues like streetlight failures or road damage.

Upload images and submit them directly through the form.

Admin Dashboard

View reported issues and update their status.

Resolve issues and keep track of ongoing reports.

Real-Time Notifications

The app will notify users upon the successful upload of images or submission of a report.

👩‍💻 Contributing

If you’d like to contribute to this project, feel free to fork the repository, create a feature branch, and submit a pull request. Please ensure that all tests pass and that your code follows the project’s style guidelines.

📄 License

This project is licensed under the MIT License - see the LICENSE
 file for details.
