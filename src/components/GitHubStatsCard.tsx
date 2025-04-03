import React, { useEffect, useState } from "react";
import { Card, CardContent } from "./ui/card";
import { FaGithub } from "react-icons/fa";
import { Skeleton } from "./ui/skeleton";

const GitHubStatsCard = ({ username }) => {
  const [loading, setLoading] = useState(true);
  const [totalCommits, setTotalCommits] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = process.env.REACT_APP_GITHUB_TOKEN;
        let commitDates = [];
  
        // Fetch all repositories
        const reposResponse = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const reposData = await reposResponse.json();
  
        // Fetch commits for each repo
        for (const repo of reposData) {
          const commitsResponse = await fetch(
            `https://api.github.com/repos/${username}/${repo.name}/commits?per_page=100`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          if (!commitsResponse.ok) continue; // Skip if error occurs
  
          const commitsData = await commitsResponse.json();
          commitsData.forEach(commit => {
            if (commit.commit && commit.commit.author) {
              const date = new Date(commit.commit.author.date).toISOString().split("T")[0]; // Extract YYYY-MM-DD
              commitDates.push(date);
            }
          });
        }
  
        // Process commit streaks
        commitDates = [...new Set(commitDates)].sort(); // Remove duplicates & sort
        setTotalCommits(commitDates.length);
  
        let currentStreak = 0;
        let longestStreak = 0;
        let streak = 0;
        let today = new Date().toISOString().split("T")[0];
        let prevDate = null;
        let foundToday = false;
  
        commitDates.forEach((date, index) => {
          if (date === today) foundToday = true;
  
          if (prevDate) {
            const diff = (new Date(date) - new Date(prevDate)) / (1000 * 60 * 60 * 24);
            if (diff === 1) {
              streak++; // Increase streak if commits are consecutive
            } else {
              longestStreak = Math.max(longestStreak, streak);
              streak = 1; // Reset streak
            }
          } else {
            streak = 1; // First commit starts a streak
          }
  
          prevDate = date;
          if (index === commitDates.length - 1) {
            longestStreak = Math.max(longestStreak, streak);
            currentStreak = foundToday ? streak : 0;
          }
        });
  
        setCurrentStreak(currentStreak);
        setLongestStreak(longestStreak);
  
        console.log("Total Commits:", commitDates.length);
        console.log("Current Streak:", currentStreak);
        console.log("Longest Streak:", longestStreak);
  
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
