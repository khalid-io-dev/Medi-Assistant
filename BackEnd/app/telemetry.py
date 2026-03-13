from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor, ConsoleSpanExporter

# Configure OpenTelemetry provider
trace.set_tracer_provider(TracerProvider())

# Get tracer instance
tracer = trace.get_tracer(__name__)

# Add console exporter for debugging/monitoring
span_processor = BatchSpanProcessor(ConsoleSpanExporter())
trace.get_tracer_provider().add_span_processor(span_processor)

__all__ = ["tracer"]
