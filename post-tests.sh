FILE=new-delivery.json
CUSTOMER_ID=$(cat customer-id)
API_KEY=$(cat production-key)

# Create a postmates delivery from a JSON file in current directory

# curl --user $API_KEY: -H "Content-Type: application/json" -d @$FILE  https://api.postmates.com/v1/customers/$CUSTOMER_ID/deliveries | jq '.'

# Get postmates delivery history

curl --user $API_KEY: https://api.postmates.com/v1/customers/$CUSTOMER_ID/deliveries
