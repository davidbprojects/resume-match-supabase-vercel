This is just a small sample project to explore vercel and supabase technologies. It also integrates with openAI for pulling keywords from job descriptions. It compares these results against a list of keywords in the user database (manually added for now). Pretty simple! Pretty Cool! Since it is public and URL is accessible set a MAX 50 searches per day because I don't want a huge OpenAI bill. 

I'll actually incorporate this as an API service for my own personal wordpress site, which is pretty cool too! I'll expand on it later, seems like Vercel is awesome on its free tier and same with supabase. The free tiers are generous for basic projects like this. Vercel is super easy to get started with. Automatic GitHub deployments and the builds are extremely fast for this site. 

You can test it live here (hopefully its working): 
https://resume-match-supabase-vercel.vercel.app/

Update: Added sonarQuode GitHub action workflow to sonarcloud.io, not much to scan, all of this is only about 200 lines of code. 