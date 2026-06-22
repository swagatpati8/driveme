import os
import json
import psycopg2
import psycopg2.extras

DATABASE_URL = os.environ["DATABASE_URL"]


def lambda_handler(event, context):
    action_group = event.get("actionGroup", "")
    function = event.get("function", "")
    params = {p["name"]: p["value"] for p in event.get("parameters", [])}

    from_city = params.get("fromCity", "").strip().lower()

    if not from_city:
        body = "Please provide a departure city."
    else:
        body = find_drivers(from_city)

    return {
        "messageVersion": "1.0",
        "response": {
            "actionGroup": action_group,
            "function": function,
            "functionResponse": {
                "responseBody": {
                    "TEXT": {"body": body}
                }
            }
        }
    }


def find_drivers(from_city):
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    cur.execute("""
        SELECT
            u.email,
            d.vehicle_model,
            d.price_per_mile,
            d.phone_number,
            array_agg(dl.city) AS cities
        FROM drivers d
        JOIN users u ON u.id = d.user_id
        JOIN driver_locations dl ON dl.driver_id = d.id
        WHERE d.available = true
        GROUP BY u.email, d.vehicle_model, d.price_per_mile, d.phone_number
        HAVING bool_or(LOWER(dl.city) = %s)
        ORDER BY d.price_per_mile ASC
    """, (from_city,))

    rows = cur.fetchall()
    cur.close()
    conn.close()

    if not rows:
        return f"No available drivers found in {from_city.title()}."

    lines = [f"Found {len(rows)} available driver(s) in {from_city.title()}:\n"]
    for r in rows:
        lines.append(
            f"- {r['email']} | {r['vehicle_model']} | "
            f"${r['price_per_mile']:.2f}/mile | {r['phone_number']}"
        )

    return "\n".join(lines)
