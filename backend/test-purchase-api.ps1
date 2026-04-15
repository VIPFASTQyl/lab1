$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsIm5hbWUiOiJFcmlqb24gR2FzaGkiLCJlbWFpbCI6ImtkNzA2OTVAdWJ0LXVuaS5uZXQiLCJpc0FkbWluIjpmYWxzZSwiaWF0IjoxNzc2MjY5Mjk4LCJleHAiOjE3NzYyNzI4OTh9.I-8fvmIIl639tfunCphQpHKURiVVWAuI1gGKi9GlS-0"
}

$body = @{
    eventId = 1
    eventTitle = "Kultura - Season 5 | Edition 1"
    ticketType = "Early Bird"
    quantity = 1
    email = "kd70695@ubt-uni.net"
    name = "Erijon Gashi"
} | ConvertTo-Json

Write-Host "Sending ticket purchase request..." -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

$response = Invoke-WebRequest -Uri "http://localhost:5000/api/purchases" `
    -Method POST `
    -Headers $headers `
    -Body $body

Write-Host "Response Status: $($response.StatusCode)" -ForegroundColor Green
Write-Host "Response Content:" -ForegroundColor Green
Write-Host ($response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10)

Write-Host ""
Write-Host "✅ Ticket purchase request sent!" -ForegroundColor Green
Write-Host "📧 Check your Mailtrap inbox for the ticket email" -ForegroundColor Cyan
Write-Host "🔗 https://mailtrap.io" -ForegroundColor Cyan
