# nasa-microservice-demo README

## This API has 2 endpoints:

### URI: /api/hello
_Method: GET_
_Params: none_
_Response content type: text/plain_

This URI provides a simple test URI to ensure that Node/Express are up and running at the URL you requested.

### URI: /api/meteors/close-approach
_Method: POST_
_Params: JSON packet (see below)_
_Request content type: application/json_
_Response content type: application/json_

## POST body must follow this specification:
```JSON
{
	"dateStart": "2019-06-01",
	"dateEnd": "2019-06-07",
	"within": {
		"value": 900000,
		"units": "miles"
  }
}```

The results are a single array of strings where each value is the name of an object passing earth within `{within.value}` distance of Earth between the dates `{dateStart}` and `{dateEnd}`.

__At the moment the API ignores units and assumes miles.__
