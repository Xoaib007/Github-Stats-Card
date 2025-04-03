import React, { useEffect, useState } from "react";
import { FaGithub } from "react-icons/fa";
import { Card, CardContent } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

const GitHubStatsCard = ({ username }) => {
  const [loading, setLoading] = useState(true);
  const [totalCommits, setTotalCommits] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = import.meta.env.VITE_GITHUB_TOKEN;
        let commitDates: string[] = [];
        
        // Fetch all repositories for the user
        const reposResponse = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const reposData = await reposResponse.json();

        // Fetch commits for each repository
        for (const repo of reposData) {
          let page = 1;
          let moreCommits = true;

          // Fetch commits in paginated manner
          while (moreCommits) {
            const commitsResponse = await fetch(
              `https://api.github.com/repos/${username}/${repo.name}/commits?per_page=100&page=${page}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );

            if (commitsResponse.ok) {
              const commitsData = await commitsResponse.json();
              if (commitsData.length === 0) {
                moreCommits = false; // No more commits
              } else {
                // Extract commit dates and add them to the list
                commitsData.forEach(commit => {
                  if (commit.commit && commit.commit.author) {
                    const date = new Date(commit.commit.author.date).toISOString().split("T")[0]; // Extract YYYY-MM-DD
                    commitDates.push(date);
                  }
                });
                page += 1; // Go to the next page of commits
              }
            } else {
              moreCommits = false; // Error or no more commits
            }
          }
        }

        // Remove duplicates and sort the commit dates
        commitDates = [...new Set(commitDates)].sort();

        // Set total commits
        setTotalCommits(commitDates.length);

        // Calculate streaks
        let currentStreakCount = 0;
        let longestStreakCount = 0;
        let streak = 0;
        let prevDate = null;
        let today = new Date().toISOString().split("T")[0];
        let foundToday = false;

        // Loop through the sorted commit dates to calculate streaks
        for (let i = 0; i < commitDates.length; i++) {
          const currentCommitDate = commitDates[i];

          if (currentCommitDate === today) foundToday = true;

          // Calculate streaks: Check if current date is consecutive to the previous one
          if (prevDate) {
            const diff = (new Date(currentCommitDate) - new Date(prevDate)) / (1000 * 60 * 60 * 24); // Difference in days
            if (diff === 1) {
              streak++; // Increase streak if consecutive commit
            } else {
              // Update longest streak when there's a break in the commit days
              longestStreakCount = Math.max(longestStreakCount, streak);
              streak = 1; // Reset streak for new series of commits
            }
          } else {
            streak = 1; // Start streak if it's the first commit date
          }

          prevDate = currentCommitDate;

          if (i === commitDates.length - 1) {
            // At the end, make sure we update the longest streak & current streak
            longestStreakCount = Math.max(longestStreakCount, streak);
            currentStreakCount = foundToday ? streak : 0; // Set current streak if today was committed
          }
        }

        setCurrentStreak(currentStreakCount);
        setLongestStreak(longestStreakCount);

        console.log("Total Commits:", commitDates.length);
        console.log("Current Streak:", currentStreakCount);
        console.log("Longest Streak:", longestStreakCount);

      } catch (error) {
        console.error("Error fetching GitHub stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [username]);

  return (
    <Card className="w-96 p-4 shadow-lg rounded-2xl border border-gray-200 bg-white">
      <CardContent className="flex flex-col items-center">
        {loading ? (
          <Skeleton className="h-6 w-48 mb-2" />
        ) : (
          <>
            <FaGithub className="h-10 w-10 text-gray-700 mb-2" />
            <h2 className="text-xl font-bold text-gray-900">{username}</h2>
            <p className="text-sm text-gray-600">Total Commits: {totalCommits}</p>
            <p className="text-sm text-gray-600">Current Streak: {currentStreak} days</p>
            <p className="text-sm text-gray-600">Longest Streak: {longestStreak} days</p>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default GitHubStatsCard;
