#!/bin/bash
set -e
base="https://kazumbah.com.au"

declare -A map=(
  ["/zumba-dance-classes/"]="/zumba-classes/"
  ["/zumba-for-seniors/"]="/zumba-for-seniors/"
  ["/top-10-fun-activities-for-fitness-in-murwillumbah/"]="/blog/fitness-activities-murwillumbah/"
  ["/about-kazumbah/"]="/about/"
  ["/zumba-classes-in-murwillumbah-kazumbah/"]="/zumba-classes-murwillumbah/"
  ["/zumba-for-weight-loss/"]="/zumba-for-weight-loss/"
  ["/?page_id=11"]="/contact/"
  ["/how-zumba-helps-with-weight-loss-the-fun-way-to-get-fit/"]="/zumba-for-weight-loss/"
  ["/contact-us-get-in-touch-with-kazumbah/"]="/contact/"
  ["/kazumbah-zumba-classes-schedule/"]="/timetable/"
  ["/zumba-classes-for-beginners/"]="/zumba-for-beginners/"
  ["/the-best-zumba-classes-for-beginners-in-murwillumbah/"]="/blog/best-zumba-classes-murwillumbah/"
  ["/5-benefits-of-joining-zumba-classes-in-murwillumbah/"]="/zumba-classes-murwillumbah/"
)

for from in "${!map[@]}"; do
  to=${map[$from]}
  url="$base$from"
  expected="$base$to"
  code=$(curl -s -o /dev/null -w "%{http_code}" -I "$url")
  loc=$(curl -s -D - -o /dev/null -I "$url" | awk '/^location:/I{print $2}' | tr -d '\r')
  final=$(curl -s -o /dev/null -L -w "%{http_code}" "$url")
  if [ "$code" != "301" ] || [ "$loc" != "$expected" ] || [ "$final" != "200" ]; then
    echo "Mismatch: $from -> $loc (code $code final $final)" >&2
  fi
done
echo "Redirect tests completed"
